import { CommentGetManyOutput } from "../../types";
import Link from "next/link";
import { UserAvatar } from "@/components/user-avatar";
import { formatDistanceToNow } from "date-fns";

interface CommentItemProps {
  comment: CommentGetManyOutput[number];
}

export const CommentItem = ({ comment }: CommentItemProps) => {
  return (
    <div className="">
      <div className="flex gap-4">
        <Link href={`/users/${comment.userId}`}>
          <UserAvatar
            size={"lg"}
            imageUrl={comment.users.imageUrl}
            name={comment.users.name}
          />
        </Link>
        <div className="flex-1 min-w-0">
          <Link href={`/users/${comment.userId}`}>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-medium text-sm pb-0.5">
                {comment.users.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
              </span>
            </div>
          </Link>
          <p className="text-sm">{comment.value}</p>
        </div>
      </div>
    </div>
  );
};
