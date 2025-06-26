import { inngest } from "./client";
import { gemini, createAgent } from "@inngest/agent-kit";
import { Sandbox } from "@e2b/code-interpreter";
import { getSandbox } from "./utils";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    const sandboxId = await step.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create("vibe-nextjs-shanu-121");
      return sandbox.sandboxId;
    });

    const summarizer = createAgent({
      name: "summarizer",
      system: "You summarize content in 2 words.",
      model: gemini({ model: "gemini-1.5-flash" }),
    });

    const { output } = await summarizer.run(
      `summarize the following text: ${event.data.text}`
    );

    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      const sandbox = await getSandbox(sandboxId);
      const host = sandbox.getHost(3000);
      return `https://${host}`;
    });
    return { output, sandboxUrl };
  }
);
