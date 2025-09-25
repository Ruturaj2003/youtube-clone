"use client";

import { CommentForm } from "@/modules/comments/ui/components/comment-form";
import { CommentItem } from "@/modules/comments/ui/components/comment-item";
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface CommentsSectionProps {
  videoId: string;
}

export const CommentsSection = ({ videoId }: CommentsSectionProps) => {
  return (
    <Suspense fallback={<p>Loading , Please Wait</p>}>
      <ErrorBoundary fallback={<p>It was sadly GG , SO wP</p>}>
        <CommentsSectionSuspense videoId={videoId} />
      </ErrorBoundary>
    </Suspense>
  );
};

const CommentsSectionSuspense = ({ videoId }: CommentsSectionProps) => {
  const [comments] = trpc.comments.getMany.useSuspenseQuery({ videoId });

  return (
    <div
      className=" mt-6 
  "
    >
      <div className="flex flex-col gap-6">
        <h1> o comments</h1>
        <CommentForm videoId={videoId} />
      </div>
      <div className="flex flex-col gap-4 mt-2">
        {comments.map((comment) => {
          return <CommentItem comment={comment} key={comment.id} />;
        })}
      </div>
    </div>
  );
};
