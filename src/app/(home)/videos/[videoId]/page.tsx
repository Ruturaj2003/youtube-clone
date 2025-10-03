import { DEFAULT_LIMIT } from "@/constants";
import { VideoView } from "@/modules/videos/ui/views/video-view";
import { HydrateClient, trpc } from "@/trpc/server";

export const dynamic = "force-dynamic";

interface VideoPageProps {
  params: Promise<{
    videoId: string;
  }>;
}

const VideoPage = async ({ params }: VideoPageProps) => {
  const { videoId } = await params;

  void trpc.videos.getOne.prefetch({
    id: videoId,
  });

  void trpc.comments.getMany.prefetchInfinite({
    videoId: videoId,
    limit: DEFAULT_LIMIT,
  });

  void trpc.suggestions.getMany.prefetchInfinite({
    videoId: videoId,
    limit: DEFAULT_LIMIT,
  });

  return (
    <HydrateClient>
      {/* Video view from videos not Studio */}
      {/* Vdieo VIew */}
      <VideoView videoId={videoId} />
    </HydrateClient>
  );
};

export default VideoPage;
