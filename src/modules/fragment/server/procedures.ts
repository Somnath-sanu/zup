import prisma from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const fragmentRouter = createTRPCRouter({
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        messageId: z.string(),
        sandboxUrl: z.string(),
      })
    )

    .mutation(async ({ input }) => {
      const existingFragment = await prisma.fragment.findUnique({
        where: {
          id: input.id,
          messageId: input.messageId,
        },
      });

      if (!existingFragment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Fragment not found",
        });
      }

      await prisma.fragment.update({
        where: {
          id: input.id,
          messageId: input.messageId,
        },
        data: {
          sandboxUrl: input.sandboxUrl,
          lastSandboxUpdate: new Date(),
        },
      });
    }),
});
