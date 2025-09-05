import { db } from "@/db";
import { users, videos, videoUpdateSchema } from "@/db/schema";
import { mux } from "@/lib/mux";
import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, eq, getTableColumns } from "drizzle-orm";
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

  getOne: baseProcedure
    // Step 1: Define the input the procedure expects
    .input(
      z.object({
        id: z.string().uuid(), // input must have an "id" field, and it must be a UUID string
      })
    )

    // Step 2: Define the query logic
    .query(async ({ input }) => {
      // Step 3: Query the database
      const [existingVideo] = await db
        // Dont know why changed the shape here , was perfectly fine
        .select({
          ...getTableColumns(videos),
          user: {
            ...getTableColumns(users),
          },
        }) // select data
        .from(videos) // start with the "videos" table
        .innerJoin(
          // join with "users" table
          users,
          eq(videos.userId, users.id) // condition: videos.userId = users.id
        )
        .where(eq(videos.id, input.id)); // filter: only the video with this specific ID

      // Step 4: Handle case where no video is found
      if (!existingVideo) {
        throw new TRPCError({
          code: "NOT_FOUND", // throw error with "NOT_FOUND" code
        });
      }

      // Step 5: Return the found video (including joined user info)
      return existingVideo;
    }),
});
