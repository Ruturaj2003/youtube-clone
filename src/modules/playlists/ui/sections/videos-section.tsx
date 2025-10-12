"use client";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { Skeleton } from "@/components/ui/skeleton";
import { DEFAULT_LIMIT } from "@/constants";
import { VideoGridCard } from "@/modules/videos/ui/components/video-grid-card";
import { VideoRowCard } from "@/modules/videos/ui/components/video-row-card";
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { toast } from "sonner";

interface VideosSectionProps {
  playlistId: string;
}

export const VideosSection = ({ playlistId }: VideosSectionProps) => {
  return (
    <Suspense fallback={<VideosSectionSkeleton />}>
      <ErrorBoundary
        fallback={"There seems to be some error in Videos Section"}
      >
        <VideosSectionSuspense playlistId={playlistId} />
      </ErrorBoundary>
    </Suspense>
  );
};

const VideosSectionSkeleton = () => {
  // Let's render 8 placeholders (you can adjust)
  const placeholders = Array.from({ length: 8 });

  return (
    <div className="flex flex-col gap-4 gap-y-10">
      {placeholders.map((_, i) => (
        <div key={i} className="flex flex-col gap-2">
          {/* Thumbnail */}
          <Skeleton className="aspect-video w-full rounded-lg" />
          {/* Title */}
          <Skeleton className="h-4 w-3/4" />
          {/* Description / extra line */}
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
};

const VideosSectionSuspense = ({ playlistId }: VideosSectionProps) => {
  const utils = trpc.useUtils();
  const [videos, query] = trpc.playlists.getVideos.useSuspenseInfiniteQuery(
    {
      playlistId,
      limit: DEFAULT_LIMIT,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  const removeVideo = trpc.playlists.addVideo.useMutation({
    onSuccess: (data) => {
      toast.success("Playlist Updated");

      // Refresh the playlist's videos
      utils.playlists.getVideos.invalidate({ playlistId });

      // Refresh any other queries that depend on this video
      utils.playlists.getManyForVideo.invalidate({ videoId: data.videoId });

      // Optional: refresh the playlist header
      utils.playlists.getOne.invalidate({ id: playlistId });
    },
    onError: () => toast.error("Something went wrong"),
  });

  return (
    <div>
      <div className="flex flex-col gap-4 gap-y-10 md:hidden">
        {videos.pages
          .flatMap((page) => page.items)
          .map((video) => (
            <VideoGridCard
              onRemove={() =>
                removeVideo.mutate({
                  playlistId,
                  videoId: video.id,
                })
              }
              key={video.id}
              data={video}
            />
          ))}
      </div>{" "}
      <div className="hidden flex-col gap-4 md:flex">
        {videos.pages
          .flatMap((page) => page.items)
          .map((video) => (
            <VideoRowCard
              onRemove={() =>
                removeVideo.mutate({
                  playlistId,
                  videoId: video.id,
                })
              }
              size={"compact"}
              key={video.id}
              data={video}
            />
          ))}
      </div>
      <InfiniteScroll
        hasNextPage={query.hasNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
        fetchNextPage={query.fetchNextPage}
      />
    </div>
  );
};
