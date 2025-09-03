"use client";
import { THUMBNAIL_FALLBACK } from "@/constants";
import MuxPlayer from "@mux/mux-player-react";
interface VideoPlayerProps {
  playbackId?: string | null | undefined;
  thumbnailUrl?: string | null | undefined;
  autoPlay?: boolean;
  onPlay?: () => void;
}

export const VideoPlayer = ({
  playbackId,
  thumbnailUrl,
  autoPlay,
  onPlay,
}: VideoPlayerProps) => {
  if (!playbackId) return null;
  return (
    <MuxPlayer
      playbackId={playbackId}
      playerInitTime={0}
      autoPlay={autoPlay}
      thumbnailTime={0}
      className="w-full h-full object-contain"
      accentColor="#e2f807"
      onPlay={onPlay}
      poster={thumbnailUrl || THUMBNAIL_FALLBACK}
    />
  );
};
