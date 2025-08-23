import { eq } from "drizzle-orm";
import {
  VideoAssetCreatedWebhookEvent,
  VideoAssetErroredWebhookEvent,
  VideoAssetReadyWebhookEvent,
  VideoAssetTrackReadyWebhookEvent,
  VideoAssetDeletedWebhookEvent,
} from "@mux/mux-node/resources/webhooks";
import { headers } from "next/headers";
import { mux } from "@/lib/mux";
import { db } from "@/db";
import { videos } from "@/db/schema";

// Mux webhook signing secret from environment
const SIGNING_SECRET = process.env.MUX_SIGNING_SECRET!;

// Union type for supported webhook events
type WebhookEvent =
  | VideoAssetCreatedWebhookEvent
  | VideoAssetErroredWebhookEvent
  | VideoAssetReadyWebhookEvent
  | VideoAssetTrackReadyWebhookEvent
  | VideoAssetDeletedWebhookEvent;

export const POST = async (req: Request) => {
  // Ensure secret is configured
  if (!SIGNING_SECRET) {
    throw new Error("MUX_WEBHOOK_SECRET is not Set");
  }

  // Extract signature from request headers
  const headersPayload = await headers();
  const muxSignature = headersPayload.get("mux-signature");

  if (!muxSignature) {
    return new Response("No Signature Found", { status: 401 });
  }

  // Parse request body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Verify webhook authenticity
  mux.webhooks.verifySignature(
    body,
    {
      "mux-signature": muxSignature,
    },
    SIGNING_SECRET
  );

  // Handle event by type
  switch (payload.type as WebhookEvent["type"]) {
    case "video.asset.created": {
      const data = payload.data as VideoAssetCreatedWebhookEvent["data"];
      if (!data.upload_id) {
        return new Response("No upload ID found ", { status: 400 });
      }

      // Update DB with asset ID and status
      await db
        .update(videos)
        .set({
          musxAssetId: data.id,
          muxStatus: data.status,
        })
        .where(eq(videos.muxUploadId, data.upload_id));

      break;
    }
    case "video.asset.ready": {
      const data = payload.data as VideoAssetReadyWebhookEvent["data"];
      const playbackId = data.playback_ids?.[0].id;

      if (!data.upload_id) {
        throw new Response("Missing Upload Id", { status: 406 });
      }

      if (!playbackId) {
        throw new Response("Missing Playback Id", { status: 406 });
      }

      // Construct media URLs
      const thumbnailUrl = `https://image.mux.com/${playbackId}/thumbnail.jpg`;
      const previewUrl = `https://image.mux.com/${playbackId}/animated.gif`;

      // Convert duration to milliseconds
      const duration = data.duration ? Math.round(data.duration * 1000) : 0;

      // Update DB with final asset details
      await db
        .update(videos)
        .set({
          muxStatus: data.status,
          muxPlaybackId: playbackId,
          musxAssetId: data.id,
          thumbnailUrl,
          previewUrl,
          duration,
        })
        .where(eq(videos.muxUploadId, data.upload_id));

      break;
    }
    case "video.asset.errored": {
      const data = payload.data as VideoAssetErroredWebhookEvent["data"];

      if (!data.upload_id) {
        throw new Response("Missing Upload Id", { status: 406 });
      }

      // Update DB with error status
      await db
        .update(videos)
        .set({
          muxStatus: data.status,
        })
        .where(eq(videos.muxUploadId, data.upload_id));
      break;
    }
    case "video.asset.deleted": {
      // Very Imp . Mux deletes data after 24hr in free tier so it'b bad
      const data = payload.data as VideoAssetDeletedWebhookEvent["data"];

      if (!data.upload_id) {
        throw new Response("Missing Upload Id", { status: 406 });
      }

      await db.delete(videos).where(eq(videos.muxUploadId, data.upload_id));
      console.log("Deleted ");

      break;
    }
    case "video.asset.track.ready": {
      // For music vid or when der is the sub the titles

      const data = payload.data as VideoAssetTrackReadyWebhookEvent["data"] & {
        asset_id: string;
      };

      const assetId = data.asset_id;
      const trackId = data.id;
      const status = data.status;
      if (!data.asset_id) {
        throw new Response("Missing Assest Id", { status: 406 });
      }

      console.log("Track Ready");

      await db
        .update(videos)
        .set({
          muxTrackId: trackId,
          muxTrackStatus: status,
        })
        .where(eq(videos.musxAssetId, assetId));
      break;
    }
  }

  return new Response("Webhook Received ", { status: 201 });
};
