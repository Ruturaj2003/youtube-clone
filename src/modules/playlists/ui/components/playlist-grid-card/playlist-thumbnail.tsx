import { Skeleton } from "@/components/ui/skeleton";
import { THUMBNAIL_FALLBACK } from "@/constants";
import { cn } from "@/lib/utils";
import { ListVideoIcon, PlayIcon } from "lucide-react";
import Image from "next/image";
import { useMemo } from "react";

interface PlaylistThumbnail {
  imageUrl?: string | null;
  title: string;
  videoCount: number;
  className?: string;
}

export const PlaylistThumbnail = ({
  imageUrl,
  title,
  videoCount,
  className,
}: PlaylistThumbnail) => {
  const compactViews = useMemo(() => {
    return Intl.NumberFormat("en", {
      notation: "compact",
    }).format(videoCount);
  }, [videoCount]);
  return (
    <div className={cn("relative pt-3 ", className)}>
      {/* Stack Effect */}
      <div className="relative">
        {/* Background Layers */}

        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-[97%]  overflow-hidden rounded-xl bg-black/20 aspect-video" />
        {/* 2 */}
        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-[98.5%]  overflow-hidden rounded-xl bg-black/25 aspect-video" />
        {/* Mian Image */}

        <div className="relative overflow-hidden w-full rounded-xl aspect-video">
          <Image
            src={imageUrl || THUMBNAIL_FALLBACK}
            alt={title}
            className="w-full h-full object-cover"
            fill
          />
          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="flex items-center gap-x-2">
              <PlayIcon className="size-4 text-white fill-white" />
              <span className="text-white font-medium">Play All</span>
            </div>
          </div>
        </div>
      </div>
      {/* Vid Count */}
      <div className="absolute bottom-2 right-2 px-1 py-0.5 rounded bg-black/80 text-white text-xs font-medium flex items-center gap-x-1 ">
        <ListVideoIcon className="size-4" />
        {compactViews} videos
      </div>
    </div>
  );
};
interface PlaylistThumbnailSkeletonProps {
  className?: string;
}

export const PlaylistThumbnailSkeleton = ({
  className,
}: PlaylistThumbnailSkeletonProps) => {
  return (
    <div className={cn("relative pt-3", className)}>
      {/* Stack effect background layers */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-[97%] aspect-video rounded-xl bg-muted" />
      <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-[98.5%] aspect-video rounded-xl bg-muted/70" />

      {/* Main thumbnail placeholder */}
      <div className="relative overflow-hidden w-full aspect-video rounded-xl">
        <Skeleton className="w-full h-full" />
      </div>

      {/* Video count badge placeholder */}
      <div className="absolute bottom-2 right-2 h-5 w-16 rounded bg-muted/80" />
    </div>
  );
};
