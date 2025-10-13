"use client";
import { InfiniteScroll } from "@/components/infinite-scroll";

import { DEFAULT_LIMIT } from "@/constants";

import { trpc } from "@/trpc/client";
import Link from "next/link";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { toast } from "sonner";
import {
  SubscriptionItem,
  SubscriptionItemSkeleton,
} from "../components/subscription-item";

export const SubscriptionsSection2 = () => {
  return (
    <Suspense fallback={<SubscriptionsListSkeleton count={5} />}>
      <ErrorBoundary
        fallback={"There seems to be some error in Videos Section"}
      >
        <SubscriptionsSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  );
};
const SubscriptionsListSkeleton = ({ count }: { count: number }) => {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SubscriptionItemSkeleton key={i} />
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
