import { UserAvatar } from "@/components/user-avatar";
import { SubcriptionButton } from "./subscription-button";

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
