"use client";
import Link from "next/link";
import { VideoGetOneOutput } from "../../types";
import { UserAvatar } from "@/components/user-avatar";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { SubcriptionButton } from "@/modules/subscriptions/ui/components/subscription-button";
import { UserInfo } from "@/modules/users/ui/components/user-info";
import { useSubscription } from "@/modules/subscriptions/hooks/use-subscription";

interface VideoOwnerProps {
  user: VideoGetOneOutput["user"];
  videoId: string;
}

export const VideoOwner = ({ user, videoId }: VideoOwnerProps) => {
  const { userId } = useAuth();
  const subscribe = useSubscription({
    isSubscribed: user.isViewerSubscribed,
    userId: user.id,
    fromVideoId: videoId,
  });
  return (
    <div className="flex items-center sm:items-start justify-between sm:justify-start gap-3 min-w-0">
      <Link href={`/users/${user.id}`}>
        <div className="flex items-center gap-3 min-w-0">
          <UserAvatar imageUrl={user.imageUrl} size={"lg"} name={user.name} />
          <div className="flex flex-col gap-1 min-w-0">
            {/* User Info */}
            <UserInfo name={user.name} size={"lg"} />
            <span className="text-sm text-muted-foreground line-clamp-1">
              {/* TODO : Setup Subcriber Count */}
              {user.subscriberCount} Subscribers
            </span>
          </div>
        </div>
      </Link>
      {userId === user.clerkId ? (
        <Button className="rounded-full" asChild variant={"secondary"}>
          <Link href={`/studio/videos/${videoId}`}>Edit Video</Link>
        </Button>
      ) : (
        //  Subscribe Button
        <SubcriptionButton
          onClick={subscribe.onClick}
          disabled={subscribe.isPending}
          isSubscribed={user.isViewerSubscribed}
          className="flex-none"
        />
      )}
    </div>
  );
};
