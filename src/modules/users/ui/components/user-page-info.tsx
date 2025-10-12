"use client";

import { UserAvatar } from "@/components/user-avatar";
import { UserGetOneOutput } from "../../types";
import { useClerk } from "@clerk/nextjs";
import { useAuth } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SubcriptionButton } from "@/modules/subscriptions/ui/components/subscription-button";
import { useSubscription } from "@/modules/subscriptions/hooks/use-subscription";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface UserPageInfoProps {
  user: UserGetOneOutput;
}

export const UserPageInfo = ({ user }: UserPageInfoProps) => {
  const clerk = useClerk();
  const { userId, isLoaded } = useAuth();
  const subscribe = useSubscription({
    isSubscribed: user.viewerSubscribed,
    userId: user.id,
  });

  return (
    <div className="py-6 border-b border-border">
      {/* Mobile layout */}
      <div className="flex flex-col md:hidden">
        <div className="flex items-center gap-4">
          <UserAvatar
            size="lg"
            imageUrl={user.imageUrl}
            name={user.name}
            className="h-[60px] w-[60px]"
            onClick={() => {
              if (user.clerkId === userId) clerk.openUserProfile();
            }}
          />

          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold truncate">{user.name}</h1>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <span>{user.subscriberCount} subscribers</span>
              <span>•</span>
              <span>{user.videoCount} videos</span>
            </div>
          </div>
        </div>

        {userId === user.clerkId ? (
          <Button
            variant="secondary"
            asChild
            className="w-full mt-3 rounded-full font-medium"
          >
            <Link href="/studio">Go to Studio</Link>
          </Button>
        ) : (
          <SubcriptionButton
            disabled={subscribe.isPending || !isLoaded}
            onClick={subscribe.onClick}
            isSubscribed={user.viewerSubscribed}
            className="w-full mt-3 rounded-full font-medium"
          />
        )}
      </div>

      {/* Desktop layout */}
      <div className="hidden md:flex items-center justify-between mt-2">
        <div className="flex items-start gap-4">
          <UserAvatar
            size="xl"
            imageUrl={user.imageUrl}
            name={user.name}
            className={cn(
              "h-[96px] w-[96px]",
              userId === user.clerkId &&
                "cursor-pointer hover:opacity-90 transition-opacity"
            )}
            onClick={() => {
              if (user.clerkId === userId) clerk.openUserProfile();
            }}
          />

          <div className="flex flex-col justify-center min-w-0">
            <h1 className="text-2xl font-semibold truncate">{user.name}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <span>{user.subscriberCount} subscribers</span>
              <span>•</span>
              <span>{user.videoCount} videos</span>
            </div>
            {userId === user.clerkId ? (
              <Button
                variant="secondary"
                asChild
                className="rounded-full px-6 font-medium"
              >
                <Link href="/studio">Go to Studio</Link>
              </Button>
            ) : (
              <SubcriptionButton
                disabled={subscribe.isPending || !isLoaded}
                onClick={subscribe.onClick}
                isSubscribed={user.viewerSubscribed}
                className="rounded-full px-6 font-medium"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export const UserPageInfoSkeleton = () => {
  return (
    <div className="py-6 border-b border-border">
      {/* Mobile Layout */}
      <div className="flex flex-col md:hidden">
        <div className="flex items-center gap-4">
          <Skeleton className="h-[60px] w-[60px] rounded-full" />
          <div className="flex-1 min-w-0">
            <Skeleton className="h-5 w-32" />
            <div className="flex items-center gap-2 mt-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </div>
        <Skeleton className="h-9 w-full mt-3 rounded-full" />
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex items-center justify-between mt-2">
        <div className="flex items-start gap-4">
          <Skeleton className="h-[96px] w-[96px] rounded-full" />
          <div className="flex flex-col justify-center min-w-0">
            <Skeleton className="h-6 w-48" />
            <div className="flex items-center gap-3 mt-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-9 w-36 mt-3 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};
