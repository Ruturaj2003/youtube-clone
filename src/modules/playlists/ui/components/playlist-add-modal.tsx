import { InfiniteScroll } from "@/components/infinite-scroll";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { Button } from "@/components/ui/button";
import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";
import { Loader2Icon, SquareCheckIcon, SquareIcon } from "lucide-react";
import { toast } from "sonner";

interface PlaylistAddModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoId: string;
}

export const PlaylistAddModal = ({
  open,
  videoId,
  onOpenChange,
}: PlaylistAddModalProps) => {
  const utils = trpc.useUtils();

  const {
    data: playlists,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = trpc.playlists.getManyForVideo.useInfiniteQuery(
    {
      limit: DEFAULT_LIMIT,
      videoId,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      //   This line below is because of the following reason
      /*
    This component is rendered in the parent compoent when it is mounted but it wont get the videoId until we click on it so to avoid fetching ,  this enalbled option is used then it will fetch when we clik add to playlist

    other method is conditional redering of this component in the parent , it wold if affec if it was some heavy op but hti is light , if it is not renderd it is not in react terree if it  is not in react tree it wont run the query and gg we win

    */
      enabled: !!videoId && open,
    }
  );

  const addVideo = trpc.playlists.addVideo.useMutation({
    onSuccess: (data) => {
      utils.playlists.getManyForVideo.invalidate({
        videoId: videoId,
        limit: DEFAULT_LIMIT,
      });
      toast.success("Playlist Updated");
      utils.playlists.getOne.invalidate({ id: data.playlistId });
    },
    onError: () => toast.error("Something went wrong"),
  });
  return (
    <ResponsiveDialog
      title="Add to playlist"
      open={open}
      onOpenChange={onOpenChange}
    >
      <div className="flex flex-col gap-2">
        {isLoading && (
          <div className="flex justify-center p-4">
            <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      {!isLoading &&
        playlists?.pages
          .flatMap((page) => page.items)
          .map((playlist) => {
            return (
              <Button
                variant={"ghost"}
                className="w-full justify-start px-2 [&_svg]:size-5"
                size={"lg"}
                key={playlist.id}
                onClick={() =>
                  addVideo.mutate({
                    videoId: videoId,
                    playlistId: playlist.id,
                  })
                }
              >
                {playlist.containsVideo ? (
                  <SquareCheckIcon className="mr-2" />
                ) : (
                  <SquareIcon className="mr-2" />
                )}
                {playlist.name}
              </Button>
            );
          })}

      {!isLoading && (
        <InfiniteScroll
          fetchNextPage={fetchNextPage}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          isManual
        />
      )}
    </ResponsiveDialog>
  );
};
