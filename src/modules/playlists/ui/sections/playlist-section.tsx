"use client";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { Skeleton } from "@/components/ui/skeleton";
import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

export const PlaylistsSection = () => {
  return (
    <Suspense fallback={<PlaylistsSectionSkeleton />}>
      <ErrorBoundary
        fallback={"There seems to be some error in Videos Section"}
      >
        <PlaylistsSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  );
};

const PlaylistsSectionSkeleton = () => {
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

const PlaylistsSectionSuspense = () => {
  const [playlists, query] = trpc.playlists.getMany.useSuspenseInfiniteQuery(
    {
      limit: DEFAULT_LIMIT,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  return (
    <div className="">
      <div className="flex flex-col gap-4 gap-y-10 ">
        {JSON.stringify(playlists)}
      </div>{" "}
      <InfiniteScroll
        hasNextPage={query.hasNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
        fetchNextPage={query.fetchNextPage}
      />
    </div>
  );
};
