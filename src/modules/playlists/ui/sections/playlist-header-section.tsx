"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/trpc/client";
import { Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { toast } from "sonner";

interface PlaylistHeaderSectionProps {
  playlistId: string;
}

export const PlaylistHeaderSection = ({
  playlistId,
}: PlaylistHeaderSectionProps) => {
  return (
    <Suspense fallback={<PlaylistHeaderSectionSkeleton />}>
      <ErrorBoundary fallback={<h1>Something went wrong</h1>}>
        <PlaylistHeaderSectionSuspense playlistId={playlistId} />
      </ErrorBoundary>
    </Suspense>
  );
};

const PlaylistHeaderSectionSuspense = ({
  playlistId,
}: PlaylistHeaderSectionProps) => {
  const router = useRouter();
  const utils = trpc.useUtils();
  const [playlist] = trpc.playlists.getOne.useSuspenseQuery({ id: playlistId });

  const remove = trpc.playlists.remove.useMutation({
    onSuccess: () => {
      toast.success("Playlist Removed");
      utils.playlists.getMany.invalidate();
      router.push("/playlists");
    },
    onError: () => {
      toast.error("Something went wrong");
    },
  });

  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold">Videos from {playlist.name}</h1>

        <p className="text-xs text-muted-foreground">
          Enjoy your custom collection of videos{" "}
        </p>
      </div>

      <Button
        onClick={() => remove.mutate({ id: playlistId })}
        className="rounded-full"
        variant={"ghost"}
        size={"icon"}
        disabled={remove.isPending}
      >
        <Trash2Icon />
      </Button>
    </div>
  );
};

export const PlaylistHeaderSectionSkeleton = () => {
  return (
    <div className="flex justify-between items-center">
      <div className="space-y-2">
        <Skeleton className="h-6 w-48" /> {/* Simulated playlist title */}
        <Skeleton className="h-4 w-72" /> {/* Simulated subtitle */}
      </div>
      <Skeleton className="h-10 w-10 rounded-full" />{" "}
      {/* Simulated delete button */}
    </div>
  );
};
