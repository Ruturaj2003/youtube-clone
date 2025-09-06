import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SubcriptionButtonProps {
  onClick: ButtonProps["onClick"];
  disabled: boolean;
  isSubscribed: boolean;
  className?: string;
  size?: ButtonProps["size"];
}

export const SubcriptionButton = ({
  disabled,
  isSubscribed,
  onClick,
  className,
  size,
}: SubcriptionButtonProps) => {
  return (
    <Button
      size={size}
      onClick={onClick}
      disabled={disabled}
      variant={isSubscribed ? "secondary" : "default"}
      className={cn("rounded-full", className)}
    >
      {isSubscribed ? "Unsubscribe" : "Subscribe"}
    </Button>
  );
};
