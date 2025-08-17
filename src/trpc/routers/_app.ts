import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../init";

export const appRouter = createTRPCRouter({
  hello: protectedProcedure
    .input(
      z.object({
        text: z.string(),
      })
    )
    .query((opts) => {
      console.log({ dbUser: opts.ctx.clerkUserId });
      return {
        greeting: `Hello ${opts.input.text}`,
      };
    }),
});

// Export type definition of API
export type AppRouter = typeof appRouter;
