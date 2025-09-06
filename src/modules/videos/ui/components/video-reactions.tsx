import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { ThumbsDownIcon, ThumbsUpIcon } from "lucide-react";
// TODO: Make it real

export const VideoReactions = () => {
  type ViewerReaction = "like" | "dislike";

  const viewerReaction: ViewerReaction = "like";

  return (
    <div className="flex items-center flex-none">
      <Button
        variant={"secondary"}
        className="rounded-l-full rounded-r-none gap-2 pr-4 "
      >
        <ThumbsUpIcon
          className={cn("size-5", viewerReaction === "like" && "fill-black")}
        />
        {1}
      </Button>
      <Separator orientation="vertical" className="h-7" />
      <Button
        variant={"secondary"}
        className="rounded-r-full rounded-l-none  pl-4 "
      >
        <ThumbsDownIcon
          className={cn("size-5", viewerReaction !== "like" && "fill-black")}
        />
        {1}
      </Button>
    </div>
  );
};
