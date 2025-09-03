import { db } from "@/db";
import { users, videos } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError, UTApi } from "uploadthing/server";
import { z } from "zod";

const f = createUploadthing();

export const ourFileRouter = {
  // File route for uploading video thumbnails
  thumbnailUploader: f({
    image: {
      maxFileSize: "4MB", // Only allow up to 4MB
      maxFileCount: 1, // Only one thumbnail per upload
    },
  })
    // Validate input: must include a videoId
    .input(
      z.object({
        videoId: z.string().uuid(),
      })
    )
    // Middleware: check auth, validate ownership, handle old thumbnail cleanup
    .middleware(async ({ input }) => {
      const { userId: clerkUserId } = await auth();
      if (!clerkUserId) throw new UploadThingError("Unauthorized");

      // Get current user
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.clerkId, clerkUserId));

      // Check if video belongs to user
      const [existingVideo] = await db
        .select({
          thumbnailKey: videos.thumbnailKey,
        })
        .from(videos)
        .where(and(eq(videos.id, input.videoId), eq(videos.userId, user.id)));
      if (!existingVideo) throw new UploadThingError("Bad Requst");

      // If a thumbnail already exists, delete it
      if (existingVideo.thumbnailKey) {
        const utApi = new UTApi();
        await utApi.deleteFiles(existingVideo.thumbnailKey);

        await db
          .update(videos)
          .set({
            thumbnailUrl: null,
            thumbnailKey: null,
          })
          .where(and(eq(videos.id, input.videoId), eq(videos.userId, user.id)));
      }

      return { user, ...input };
    })
    // After upload: save new thumbnail URL and key
    .onUploadComplete(async ({ metadata, file }) => {
      await db
        .update(videos)
        .set({
          thumbnailUrl: file.url,
          thumbnailKey: file.key,
        })
        .where(
          and(
            eq(videos.id, metadata.videoId),
            eq(videos.userId, metadata.user.id)
          )
        );

      return { uploadedBy: metadata.user.id };
    }),
} satisfies FileRouter;

// Export router type for type safety
export type OurFileRouter = typeof ourFileRouter;
