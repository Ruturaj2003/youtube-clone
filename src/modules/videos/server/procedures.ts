import { db } from "@/db";
import {
  subscriptions,
  users,
  videoReactions,
  videos,
  videoUpdateSchema,
  videoViews,
} from "@/db/schema";
import { mux } from "@/lib/mux";
import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, eq, getTableColumns, inArray, isNotNull } from "drizzle-orm";
import { UTApi } from "uploadthing/server";
import { z } from "zod";

export const videosRouter = createTRPCRouter({
  create: protectedProcedure.mutation(async ({ ctx }) => {
    const { id: userId } = ctx.user;
    const upload = await mux.video.uploads.create({
      new_asset_settings: {
        passthrough: userId,
        playback_policy: ["public"],
        mp4_support: "capped-1080p",
        input: [
          {
            generated_subtitles: [
              {
                language_code: "en",
                name: "English",
              },
            ],
          },
        ],
      },
      cors_origin: "*", //TODO in prod change
    });

    const [video] = await db
      .insert(videos)
      .values({
        userId,
        title: "Untitled",
        muxStatus: "waiting",
        muxUploadId: upload.id,
      })
      .returning();

    return {
      video: video,
      url: upload.url,
    };
  }),
  update: protectedProcedure
    .input(videoUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      if (!input.id) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }
      const [updatedVideo] = await db
        .update(videos)
        .set({
          title: input.title,
          description: input.description,
          categoryId: input.categoryId,
          visibility: input.visibility,
          updatedAt: new Date(),
        })
        .where(and(eq(videos.id, input.id), eq(videos.userId, userId)))
        .returning();

      if (!updatedVideo) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
    }),
  /*
    
    
    For separation
    
    
    
    */
  remove: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;

      const [removedVideo] = await db
        .delete(videos)
        .where(and(eq(videos.id, input.id), eq(videos.userId, userId)))
        .returning();

      if (!removedVideo) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      return removedVideo;
    }),
  /*
    
    
    For separation
    
    
    
    */
  restoreThumbnail: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const [existingVideo] = await db
        .select()
        .from(videos)
        .where(and(eq(videos.id, input.id), eq(videos.userId, userId)));

      if (!existingVideo) throw new TRPCError({ code: "NOT_FOUND" });

      if (existingVideo.thumbnailKey) {
        const utApi = new UTApi();
        await utApi.deleteFiles(existingVideo.thumbnailKey);

        await db
          .update(videos)
          .set({
            thumbnailUrl: null,
            thumbnailKey: null,
          })
          .where(and(eq(videos.id, input.id), eq(videos.userId, userId)));
      }
      if (!existingVideo.muxPlaybackId)
        throw new TRPCError({ code: "BAD_REQUEST" });

      const tempThumbnailUrl = `https://image.mux.com/${existingVideo.muxPlaybackId}/thumbnail.jpg`;

      const utApi = new UTApi();
      const uploadedThumbnail = await utApi.uploadFilesFromUrl(
        tempThumbnailUrl
      );

      if (!uploadedThumbnail.data) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
      const { key: thumbnailKey, url: thumbnailUrl } = uploadedThumbnail.data;
      const [updatedVideo] = await db
        .update(videos)
        .set({ thumbnailUrl: thumbnailUrl, thumbnailKey: thumbnailKey })
        .where(eq(videos.id, input.id))
        .returning();

      return updatedVideo;
    }),

  /*
    
    
    For separation
    
    
    
    */
  getOne: baseProcedure
    // Expect input: an object with a video "id" (must be a UUID)
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )

    .query(async ({ input, ctx }) => {
      // 1️⃣ Get logged-in user's ID (if any)
      const { clerkUserId } = ctx;
      let userId;

      // SUBQUERY #1: Find the user by their Clerk ID
      const [user] = await db
        .select()
        .from(users)
        .where(inArray(users.clerkId, clerkUserId ? [clerkUserId] : []));

      if (user) {
        userId = user.id;
      }

      // SUBQUERY #2: Build a "viewerReactions" CTE (temporary table)
      // This contains all reactions (like/dislike) by the current user
      const viewerReactions = db.$with("viewr_reactions").as(
        db
          .select({
            videoId: videoReactions.videoId,
            type: videoReactions.type,
          })
          .from(videoReactions)
          .where(inArray(videoReactions.userId, userId ? [userId] : []))
      );

      const viewerSubscriptions = db.$with("viewer_subscriptions").as(
        db
          .select()
          .from(subscriptions)
          .where(inArray(subscriptions.viewerId, userId ? [userId] : []))
      );

      // MAIN QUERY: Fetch the video with all related data
      const [existingVideo] = await db
        .with(viewerReactions, viewerSubscriptions) // include the "viewerReactions" subquery
        .select({
          ...getTableColumns(videos), // all video columns
          user: {
            ...getTableColumns(users), // all user columns (video uploader)
            subscriberCount: db.$count(
              subscriptions,
              eq(subscriptions.creatorId, users.id)
            ),

            isViewerSubscribed: isNotNull(viewerSubscriptions.viewerId).mapWith(
              Boolean
            ),
          },
          viewCount: db.$count(videoViews, eq(videos.userId, users.id)), // total views
          likeCount: db.$count(
            videoReactions,
            and(
              eq(videoReactions.videoId, videos.id),
              eq(videoReactions.type, "like")
            )
          ),
          dislikeCount: db.$count(
            videoReactions,
            and(
              eq(videoReactions.videoId, videos.id),
              eq(videoReactions.type, "dislike")
            )
          ),
          viewerReaction: viewerReactions.type, // this user's reaction (if any)
        })
        .from(videos)
        .innerJoin(
          users,
          eq(videos.userId, users.id) // match video uploader
        )
        .leftJoin(viewerReactions, eq(viewerReactions.videoId, videos.id))
        .leftJoin(
          viewerSubscriptions,
          eq(viewerSubscriptions.creatorId, users.id)
        )
        .where(eq(videos.id, input.id)); // find by requested video ID
      // .groupBy(videos.id, users.id, viewerReactions.type);

      // If no video found, throw a NOT_FOUND error
      if (!existingVideo) {
        throw new TRPCError({
          code: "NOT_FOUND",
        });
      }

      // Return the video + uploader + counts + viewer's reaction
      return existingVideo;
    }),
});
