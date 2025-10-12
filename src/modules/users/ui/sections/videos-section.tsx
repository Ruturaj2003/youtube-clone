"use client";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { Skeleton } from "@/components/ui/skeleton";
import { DEFAULT_LIMIT } from "@/constants";
import { VideoGridCard } from "@/modules/videos/ui/components/video-grid-card";
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface VideosSectionProps {
  userId?: string;
}

export const VideosSection = (props: VideosSectionProps) => {
  return (
    <Suspense key={props.userId} fallback={<VideosSectionSkeleton />}>
      <ErrorBoundary
        fallback={"There seems to be some error in Videos Section"}
      >
        <VideosSectionSuspense userId={props.userId} />
      </ErrorBoundary>
    </Suspense>
  );
};

const VideosSectionSkeleton = () => {
  // Let's render 8 placeholders (you can adjust)
  const placeholders = Array.from({ length: 8 });

  return (
    <div className="gap-4 gap-y-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 ">
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

const VideosSectionSuspense = (props: VideosSectionProps) => {
  const [videos, query] = trpc.videos.getMany.useSuspenseInfiniteQuery(
    {
      userId: props.userId,
      limit: DEFAULT_LIMIT,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  return (
    <div>
      <div className="gap-4 gap-y-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 ">
        {videos.pages
          .flatMap((page) => page.items)
          .map((video) => (
            <VideoGridCard key={video.id} data={video} />
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
