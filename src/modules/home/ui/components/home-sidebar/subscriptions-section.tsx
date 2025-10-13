"use client";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/user-avatar";
import { trpc } from "@/trpc/client";
import { ListIcon } from "lucide-react";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const SubscriptionsSection = () => {
  const pathName = usePathname();
  const { data, isLoading } = trpc.subscriptions.getMany.useInfiniteQuery(
    {
      limit: 5,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );
  return (
    <>
      {isLoading && <SubscriptionsSectionSkeleton />}
      {!isLoading && (
        <SidebarGroup>
          <SidebarGroupLabel>Subscriptions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data?.pages
                .flatMap((page) => page.items)
                .map((subscription) => {
                  return (
                    <SidebarMenuItem
                      key={subscription.creatorId + subscription.viewerId}
                    >
                      <SidebarMenuButton
                        tooltip={subscription.user.name}
                        asChild
                        isActive={pathName === `/users/${subscription.user.id}`}
                      >
                        <Link
                          prefetch
                          href={`/users/${subscription.user.id}`}
                          className="flex items-center gap-4"
                        >
                          <UserAvatar
                            size={"xs"}
                            imageUrl={subscription.user.imageUrl}
                            name={subscription.user.name}
                          />
                          <span className="text-sm">
                            {subscription.user.name}
                          </span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}

              {!isLoading && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathName === "/subscriptions"}
                  >
                    <Link
                      prefetch
                      href={"/subscriptions"}
                      className="flex items-center gap-4"
                    >
                      <ListIcon className="size-4" />
                      <span className="text-sm">All subscriptions </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      )}
    </>
  );
};
export const SubscriptionsSectionSkeleton = () => {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Subscriptions</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {Array.from({ length: 5 }).map((_, i) => (
            <SidebarMenuItem key={i}>
              <SidebarMenuButton asChild>
                <div className="flex items-center gap-4">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};
