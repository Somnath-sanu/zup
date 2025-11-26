import { getSandboxRecreationStatus } from "@/lib/sandbox";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { z } from "zod";
import { createNewSandbox } from "@/modules/projects/server/sandbox";

export const sandboxRouter = createTRPCRouter({
  status: protectedProcedure.query(async ({ ctx }) => {
    try {
      if (!ctx.auth.userId) {
        return null;
      }
      const result = await getSandboxRecreationStatus(ctx.auth.userId);
      return result;
    } catch {
      return null;
    }
  }),

  create: protectedProcedure
    .input(
      z.object({
        files: z.record(z.string()),
      })
    )
    .mutation(async ({ input }) => {
      const sandboxUrl = await createNewSandbox(input.files);
      return sandboxUrl;
    }),
});
