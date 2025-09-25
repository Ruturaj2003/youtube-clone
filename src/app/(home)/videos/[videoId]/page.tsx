import { VideoView } from "@/modules/videos/ui/views/video-view";
import { HydrateClient, trpc } from "@/trpc/server";

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

  // TODO : Later Change to prfInfite
  void trpc.comments.getMany.prefetch({ videoId: videoId });

  return (
    <HydrateClient>
      {/* Video view from videos not Studio */}
      {/* Vdieo VIew */}
      <VideoView videoId={videoId} />
    </HydrateClient>
  );
};

export default VideoPage;
