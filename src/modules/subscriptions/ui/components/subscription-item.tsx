import { UserAvatar } from "@/components/user-avatar";
import { SubcriptionButton } from "./subscription-button";
import { Skeleton } from "@/components/ui/skeleton";
interface SubscriptionItemProps {
  name: string;
  imageUrl: string;

  subscriberCount: number;
  onUnsubscribe: () => void;
  disabled: boolean;
}

export const SubscriptionItem = ({
  disabled,
  imageUrl,
  name,
  onUnsubscribe,
  subscriberCount,
}: SubscriptionItemProps) => {
  return (
    <div className="flex items-start gap-4">
      <UserAvatar size={"lg"} imageUrl={imageUrl} name={name} />

      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm">{name}</h3>
            <p className="text-xs text-muted-foreground">
              {subscriberCount} subscribers
            </p>
          </div>
          <SubcriptionButton
            onClick={(e) => {
              e.preventDefault();
              onUnsubscribe();
            }}
            disabled={disabled}
            isSubscribed
            size={"sm"}
          ></SubcriptionButton>
        </div>
      </div>
    </div>
  );
};
export const SubscriptionItemSkeleton = () => {
  return (
    <div className="flex items-start gap-4">
      <Skeleton className="h-12 w-12 rounded-full" /> {/* Avatar */}
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-4 w-32" /> {/* Name */}
            <Skeleton className="h-3 w-24" /> {/* Subscriber count */}
          </div>
          <Skeleton className="h-8 w-20 rounded-md" />{" "}
          {/* Subscription button */}
        </div>
      </div>
    </div>
  );
};
