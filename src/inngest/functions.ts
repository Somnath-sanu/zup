import { inngest } from "./client";
import {
  gemini,
  createAgent,
  createTool,
  createNetwork,
  Tool,
  type Message,
  createState,
} from "@inngest/agent-kit";
import { Sandbox } from "@e2b/code-interpreter";
import { getSandbox, lastAssistantTextMessageContent } from "./utils";
import { z } from "zod";
import { FRAGMENT_TITLE_PROMPT, PROMPT, RESPONSE_PROMPT } from "@/prompt";
import prisma from "@/lib/db";
import { SANDBOX_TIMEOUT } from "@/types";
import { firecrawl } from "@/firecrawl";

interface AgentState {
  summary: string;
  files: { [path: string]: string };
}

export const codeAgentFunction = inngest.createFunction(
  {
    id: "code-agent",
    retries: 3,
    onFailure: async ({ event }) => {
      await prisma.message.create({
        data: {
          content: "Something went wrong. Please try again.",
          role: "ASSISTANT",
          type: "ERROR",
          projectId: event.data.event.data.projectId,
        },
      });
    },
  },
  { event: "code-agent/run" },
  async ({ event, step }) => {
    const sandboxId = await step.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create("web3chat-nextjs");
      await sandbox.setTimeout(SANDBOX_TIMEOUT); // 20 minutes
      return sandbox.sandboxId;
    });

    const previousMessages = await step.run(
      "get-previous-messages",
      async () => {
        const formattedMessages: Message[] = [];

        const messages = await prisma.message.findMany({
          where: {
            projectId: event.data.projectId,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 5,
        });

        for (const message of messages) {
          formattedMessages.push({
            type: "text",
            role: message.role === "ASSISTANT" ? "assistant" : "user",
            content: message.content,
          });
        }

        return formattedMessages.reverse();
      }
    );

    const state = createState<AgentState>(
      {
        summary: "",
        files: {},
      },
      {
        messages: previousMessages,
      }
    );

    const codeAgent = createAgent<AgentState>({
      name: "code-agent",
      description: "An expert coding agent.",
      system: PROMPT,
      model: gemini({ model: "gemini-2.5-pro" }),
      tools: [
        createTool({
          name: "terminal",
          description: "Use the terminal to run commands",
          parameters: z.object({
            command: z.string(),
          }),
          handler: async ({ command }, { step }) => {
            return await step?.run("terminal", async () => {
              const buffers = { stdout: "", stderr: "" };

              try {
                const sandbox = await getSandbox(sandboxId);
                const result = await sandbox.commands.run(command, {
                  onStdout: (data: string) => {
                    buffers.stdout += data;
                  },
                  onStderr: (data: string) => {
                    buffers.stderr += data;
                  },
                });

                return result.stdout;
              } catch (error) {
                console.error(
                  `Command failed: ${error} \nstdout: ${buffers.stdout}\nstderr: ${buffers.stderr}`
                );
                return `Command failed: ${error} \nstdout: ${buffers.stdout}\nstderr: ${buffers.stderr}`;
              }
            });
          },
        }),

        createTool({
          name: "createOrUpdateFiles",
          description: "Create or update files in the sandbox",
          parameters: z.object({
            files: z.array(
              z.object({
                path: z.string(),
                content: z.string(),
              })
            ),
          }),
          handler: async (
            { files },
            { step, network }: Tool.Options<AgentState>
          ) => {
            const newFiles = await step?.run(
              "createOrUpdateFiles",
              async () => {
                try {
                  const updatedFiles = network.state.data.files || {};
                  const sandbox = await getSandbox(sandboxId);
                  for (const file of files) {
                    await sandbox.files.write(file.path, file.content);
                    updatedFiles[file.path] = file.content;
                  }

                  return updatedFiles;
                } catch (error) {
                  return "Error :" + error;
                }
              }
            );

            if (typeof newFiles === "object") {
              network.state.data.files = newFiles;
            }
          },
        }),

        createTool({
          name: "readFiles",
          description: "Read files from the sandbox",
          parameters: z.object({
            files: z.array(z.string()),
          }),
          handler: async ({ files }, { step }) => {
            return step?.run("readFiles", async () => {
              try {
                const sandbox = await getSandbox(sandboxId);
                const contents: { path: string; content: string }[] = [];
                for (const file of files) {
                  const content = await sandbox.files.read(file);
                  contents.push({
                    path: file,
                    content,
                  });
                }

                return JSON.stringify(contents);
              } catch (error) {
                return "Error :" + error;
              }
            });
          },
        }),

        createTool({
          name: "scrape",
          description: "Scrape a website to get data to clone it pixel perfect",
          parameters: z.object({
            url: z.string(),
          }),
          handler: async ({ url }, { step }) => {
            return step?.run("scrape", async () => {
              try {
                const response = await firecrawl.scrape(url, {
                  formats: [
                    "rawHtml",
                    "screenshot",
                    "markdown",
                    "html",
                    "links",
                  ],
                  maxAge: 3600000, // 1 hour in milliseconds
                });
                return JSON.stringify(response);
              } catch (error: any) {
                const message =
                  error?.message ||
                  error?.toString() ||
                  error ||
                  "Unknown error";

                if (message.includes("not currently supported")) {
                  return {
                    success: false,
                    errorType: "UNSUPPORTED_WEBSITE",
                    message:
                      "This website cannot be scraped using Firecrawl. Use your own knowledge to scrape it. Don't call this tool again.",
                  };
                }
                return "Error :" + message;
              }
            });
          },
        }),
      ],
      lifecycle: {
        onResponse: async ({ result, network }) => {
          const lastAssistantMessageText =
            lastAssistantTextMessageContent(result);
          if (lastAssistantMessageText && network) {
            if (lastAssistantMessageText.includes("<task_summary>")) {
              network.state.data.summary = lastAssistantMessageText;
            }
          }

          return result;
        },
      },
    });

    const network = createNetwork<AgentState>({
      name: "coding-agent-network",
      agents: [codeAgent],
      maxIter: 15,
      defaultState: state,
      router: async ({ network }) => {
        const summary = network.state.data.summary;

        if (summary) {
          return;
        }

        return codeAgent;
      },
    });

    const result = await network.run(event.data.text, { state }); // i am sending text via trpc

    const fragmentTitleGenerator = createAgent({
      name: "fragment-title-code-agent",
      description: "A fragment title generator.",
      system: FRAGMENT_TITLE_PROMPT,
      model: gemini({ model: "gemini-2.5-flash" }),
    });
    const responseGenerator = createAgent({
      name: "response-generator-code-agent",
      description: "A response generator.",
      system: RESPONSE_PROMPT,
      model: gemini({ model: "gemini-2.5-flash" }),
    });

    const { output: fragmentTitleOutput } = await fragmentTitleGenerator.run(
      result.state.data.summary
    );
    const { output: responseOutput } = await responseGenerator.run(
      result.state.data.summary
    );

    const generateFragmentTitle = (): string => {
      if (fragmentTitleOutput[0].type !== "text") {
        return "Fragment";
      }

      if (Array.isArray(fragmentTitleOutput[0].content)) {
        return fragmentTitleOutput[0].content.map((txt) => txt).join("");
      } else {
        return fragmentTitleOutput[0].content;
      }
    };

    const generateResponse = (): string => {
      if (responseOutput[0].type !== "text") {
        return "Here you go";
      }

      if (Array.isArray(responseOutput[0].content)) {
        return responseOutput[0].content.map((txt) => txt).join("");
      } else {
        return responseOutput[0].content;
      }
    };

    const isError =
      !result.state.data.summary ||
      Object.keys(result.state.data.files || {}).length === 0;

    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      const sandbox = await getSandbox(sandboxId);
      const host = sandbox.getHost(3000);
      return `https://${host}`;
    });

    await step.run("save-result", async () => {
      if (isError) {
        return await prisma.message.create({
          data: {
            content: "Something went wrong. Please try again.",
            role: "ASSISTANT",
            type: "ERROR",
            projectId: event.data.projectId,
          },
        });
      }
      return await prisma.message.create({
        data: {
          content: generateResponse(),
          role: "ASSISTANT",
          type: "RESULT",
          projectId: event.data.projectId,
          fragment: {
            create: {
              sandboxUrl: sandboxUrl,
              title: generateFragmentTitle(),
              files: result.state.data.files
            },
          },
        },
      });
    });

    return {
      url: sandboxUrl,
      title: "Fragment",
      files: result.state.data.files,
      summary: result.state.data.summary,
    };
  }
);
