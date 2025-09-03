"use client";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { UploadDropzone } from "@/lib/uploadthing";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";

interface ThumbnailUploadModalProps {
  videoId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ThumbnailUploadModal = ({
  onOpenChange,
  open,
  videoId,
}: ThumbnailUploadModalProps) => {
  const utils = trpc.useUtils();
  const onUploadComplete = () => {
    utils.studio.getOne.invalidate({ id: videoId });
    utils.studio.getMany.invalidate();
    onOpenChange(false);
    toast.success("Thumbnail Updated");
  };
  return (
    <ResponsiveDialog
      onOpenChange={onOpenChange}
      open={open}
      title="Upload Your Thumbnail"
    >
      <UploadDropzone
        input={{ videoId: videoId }}
        endpoint={"thumbnailUploader"}
        onClientUploadComplete={onUploadComplete}
      />
    </ResponsiveDialog>
  );
};
