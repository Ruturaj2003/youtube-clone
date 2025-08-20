import { db } from "@/db";
import { videos } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { eq, and, or, desc, lt } from "drizzle-orm";
import z from "zod";

export const studioRouter = createTRPCRouter({
  getMany: protectedProcedure
    // Check the input shape with zod
    .input(
      z.object({
        cursor: z
          .object({
            id: z.string().uuid(), // last video id we stopped at
            updatedAt: z.date(), // last video updated time
          })
          .nullish(), // can be empty (first page)
        limit: z.number().min(1).max(100), // how many videos to load
      })
    )
    .query(async ({ ctx, input }) => {
      const { cursor, limit } = input;
      const { id: userId } = ctx.user; // get current logged-in user

      // Get this user's videos from the database
      const data = await db
        .select()
        .from(videos)
        .where(
          and(
            eq(videos.userId, userId), // only this user's videos
            cursor
              ? or(
                  // if cursor exists, get videos newer than cursor
                  lt(videos.updatedAt, cursor.updatedAt),
                  // if same updatedAt, use id to break the tie
                  and(
                    eq(videos.updatedAt, cursor.updatedAt),
                    lt(videos.id, cursor.id)
                  )
                )
              : undefined // if no cursor, just load first set
          )
        )
        // sort newest first
        .orderBy(desc(videos.updatedAt), desc(videos.id))
        // load one extra item to check if more pages exist
        .limit(limit + 1);

      // check if we have more items than the limit
      const hasMore = data.length > limit;

      // cut off the extra item if we have more
      const items = hasMore ? data.slice(0, -1) : data;

      // find the last item, use it as the "bookmark" for next page
      const lastItem = items[items.length - 1];
      const nextCursor = hasMore
        ? {
            id: lastItem.id,
            updatedAt: lastItem.updatedAt,
          }
        : null;

      // return the videos + the bookmark for next call
      return {
        items,
        nextCursor,
      };
    }),
});
