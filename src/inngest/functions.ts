import { inngest } from "./client";
import { gemini, createAgent } from "@inngest/agent-kit";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event }) => {
    const summarizer = createAgent({
      name: "summarizer",
      system: "You summarize content in 2 words.",
      model: gemini({ model: "gemini-1.5-flash" }),
    });

    const { output } = await summarizer.run(
      `summarize the following text: ${event.data.text}`
    );
    return output;
  }
);
