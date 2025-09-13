import { z } from "zod";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";

import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { videoReactions } from "@/db/schema";

// TODO: improve how video count works to be more youtube-like. ex. count views for unsigned users, increase count if user watches video more times.

export const videoReactionsRouter = createTRPCRouter({
  like: protectedProcedure
    .input(z.object({ videoId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { videoId } = input;
      const { id: userId } = ctx.user;

      const [existingVideoReaction] = await db
        .select()
        .from(videoReactions)
        .where(
          and(
            eq(videoReactions.videoId, videoId),
            eq(videoReactions.userId, userId),
            eq(videoReactions.type, "like")
          )
        );

      if (existingVideoReaction) {
        const [deletedViewReactions] = await db
          .delete(videoReactions)
          .where(
            and(
              eq(videoReactions.userId, userId),
              eq(videoReactions.videoId, videoId)
            )
          )
          .returning();

        return deletedViewReactions;
      }

      const [createdVideoReaction] = await db
        .insert(videoReactions)
        .values({
          videoId,
          userId,
          type: "like",
        })
        // For dislike
        .onConflictDoUpdate({
          target: [videoReactions.userId, videoReactions.videoId],
          set: {
            type: "like",
          },
        })
        .returning();

      return createdVideoReaction;
    }),
  dislike: protectedProcedure
    .input(z.object({ videoId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { videoId } = input;
      const { id: userId } = ctx.user;

      const [existingVideoReaction] = await db
        .select()
        .from(videoReactions)
        .where(
          and(
            eq(videoReactions.videoId, videoId),
            eq(videoReactions.userId, userId),
            eq(videoReactions.type, "dislike")
          )
        );

      if (existingVideoReaction) {
        const [deletedViewReactions] = await db
          .delete(videoReactions)
          .where(
            and(
              eq(videoReactions.userId, userId),
              eq(videoReactions.videoId, videoId)
            )
          )
          .returning();

        return deletedViewReactions;
      }

      const [createdVideoReaction] = await db
        .insert(videoReactions)
        .values({
          videoId,
          userId,
          type: "dislike",
        })
        // For like
        .onConflictDoUpdate({
          target: [videoReactions.userId, videoReactions.videoId],
          set: {
            type: "dislike",
          },
        })
        .returning();

      return createdVideoReaction;
    }),
});
