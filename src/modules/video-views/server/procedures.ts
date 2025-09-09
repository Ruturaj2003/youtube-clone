import { z } from "zod";
import { db } from "@/db";
import { videoViews } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

export const videoViewsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ videoId: z.string().cuid2() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const { videoId } = input;

      // Insert if not exists, otherwise do nothing
      const [view] = await db
        .insert(videoViews)
        .values({ videoId, userId })
        .onConflictDoNothing() // prevents duplicate views
        .returning();

      return view ?? { videoId, userId };
    }),
});
