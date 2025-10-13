"use client";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { Skeleton } from "@/components/ui/skeleton";
import { DEFAULT_LIMIT } from "@/constants";

import { trpc } from "@/trpc/client";
import Link from "next/link";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { toast } from "sonner";
import { SubscriptionItem } from "../components/subscription-item";

export const SubscriptionsSection2 = () => {
  return (
    <Suspense fallback={<SubscriptionSectionSkeleton2 />}>
      <ErrorBoundary
        fallback={"There seems to be some error in Videos Section"}
      >
        <SubscriptionsSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  );
};

const SubscriptionSectionSkeleton2 = () => {
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

const SubscriptionsSectionSuspense = () => {
  const utils = trpc.useUtils();
  const [subscriptions, query] =
    trpc.subscriptions.getMany.useSuspenseInfiniteQuery(
      {
        limit: DEFAULT_LIMIT,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );
  const unSubscribe = trpc.subscriptions.remove.useMutation({
    onSuccess: (data) => {
      toast.success("UnSubscribed");
      utils.videos.getManySubscribed.invalidate();
      utils.subscriptions.getMany.invalidate();
      utils.users.getOne.invalidate({ id: data.creatorId });
      //   Referesh the Sub count , so give real time sub count
    },
    onError: () => {
      toast.error("Something went wrong");
    },
  });

  return (
    <div>
      <div className="flex flex-col gap-4 ">
        {subscriptions.pages
          .flatMap((page) => page.items)
          .map((subscription) => (
            <Link
              key={subscription.creatorId + subscription.viewerId}
              href={`/users/${subscription.user.id}`}
            >
              <SubscriptionItem
                name={subscription.user.name}
                imageUrl={subscription.user.imageUrl}
                subscriberCount={subscription.user.subscriberCount}
                onUnsubscribe={() => {
                  unSubscribe.mutate({ userId: subscription.creatorId });
                }}
                disabled={unSubscribe.isPending}
              />
            </Link>
          ))}
      </div>{" "}
      <InfiniteScroll
        hasNextPage={query.hasNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
        fetchNextPage={query.fetchNextPage}
      />
    </div>
  );
};
