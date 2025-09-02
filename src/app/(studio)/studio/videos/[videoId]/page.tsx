import { VideoView } from "@/modules/studio/ui/view/video-view";
import { HydrateClient, trpc } from "@/trpc/server";

export const dynamic = "force-dynamic";

interface VideoIdPageProps {
  params: Promise<{ videoId: string }>;
}

const VideoIdPage = async ({ params }: VideoIdPageProps) => {
  const { videoId } = await params;
  console.log("Page of stud vid prefetch", videoId);

  void trpc.studio.getOne.prefetch({ id: videoId });
  void trpc.categories.getMany.prefetch();
  return (
    <HydrateClient>
      {/* Video View with id */}

      <VideoView videoId={videoId} />
    </HydrateClient>
  );
};

export default VideoIdPage;
