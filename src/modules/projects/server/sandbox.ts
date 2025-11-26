import { SANDBOX_TIMEOUT } from "@/types";
import Sandbox from "@e2b/code-interpreter";
import { consumeSandboxRecreationCredit } from "@/lib/sandbox";
import { auth } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";

export const createNewSandbox = async (files: {
  [path: string]: string;
}): Promise<string> => {
  // Get userId from Clerk auth (server context only)
  const { userId } = await auth();

  if (!userId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "User not authenticated",
    });
  }

  // Check and consume sandbox recreation credit
  try {
    await consumeSandboxRecreationCredit(userId);
  } catch (error: any) {
    // Rate limit exceeded
    if (error.msBeforeNext) {
      const hoursRemaining = Math.ceil(error.msBeforeNext / (1000 * 60 * 60));
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: `Daily sandbox recreation limit reached. Try again in ${hoursRemaining} hour${
          hoursRemaining > 1 ? "s" : ""
        }.`,
      });
    }
    throw error;
  }

  const newSandbox = await Sandbox.create("web3chat-nextjs");
  await newSandbox.setTimeout(SANDBOX_TIMEOUT); // 20 minutes

  for (const [path, code] of Object.entries(files)) {
    await newSandbox.files.write(path, code);
  }

  const host = newSandbox.getHost(3000);
  return `https://${host}`;
};
