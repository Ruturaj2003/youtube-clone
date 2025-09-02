"use client";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/client";
import { Loader2Icon, PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { StudioUploader } from "./studio-uploader";
import { useRouter } from "next/navigation";

export const StudioUploadModal = () => {
  // This Util makes it the boss , it makes it real time kinda
  const utils = trpc.useUtils();
  const router = useRouter();
  const create = trpc.videos.create.useMutation({
    onSuccess: () => {
      toast.success("Video Created");
      utils.studio.getMany.invalidate();
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const onSuccess = () => {
    if (!create.data?.video.id) return;
    create.reset();
    router.push("/studio/videos/" + create.data.video.id);
  };
  return (
    <>
      <ResponsiveDialog
        title="Upload a video"
        onOpenChange={() => {
          create.reset();
        }}
        open={!!create.data?.url}
      >
        {create.data?.url ? (
          <StudioUploader onSuccess={onSuccess} endpoint={create.data.url} />
        ) : (
          <Loader2Icon />
        )}
      </ResponsiveDialog>
      <Button
        disabled={create.isPending}
        variant={"secondary"}
        onClick={() => create.mutate()}
      >
        {create.isPending ? (
          <Loader2Icon className="animate-spin" />
        ) : (
          <PlusIcon />
        )}
        Create
      </Button>
    </>
  );
};
