import { DEFAULT_LIMIT } from "@/constants";
import { VideosView } from "@/modules/playlists/ui/views/videos-view";
import { HydrateClient, trpc } from "@/trpc/server";

export const dynamic = "force-dynamic";

interface SinglePlaylistPageProps {
  params: Promise<{ playlistId: string }>;
}

const SinglePlaylistPage = async ({ params }: SinglePlaylistPageProps) => {
  const { playlistId } = await params;

  void trpc.playlists.getVideos.prefetchInfinite({
    playlistId,
    limit: DEFAULT_LIMIT,
  });

  void trpc.playlists.getOne.prefetch({ id: playlistId });
  return (
    <>
      <HydrateClient>
        <VideosView playlistId={playlistId} />
      </HydrateClient>
    </>
  );
};

export default SinglePlaylistPage;
