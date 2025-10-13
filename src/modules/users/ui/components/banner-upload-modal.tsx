"use client";

import { ResponsiveDialog } from "@/components/responsive-dialog";
import { UploadDropzone } from "@/lib/uploadthing";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";

interface BannerUploadModalProps {
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BannerUploadModal = ({
  onOpenChange,
  open,
  userId,
}: BannerUploadModalProps) => {
  const utils = trpc.useUtils();

  const onUploadComplete = () => {
    utils.users.getOne.invalidate({
      id: userId,
    });
    onOpenChange(false);
    toast.success("Banner Updated");
  };

  return (
    <ResponsiveDialog
      onOpenChange={onOpenChange}
      open={open}
      title="Upload Your Banner"
    >
      <UploadDropzone
        endpoint="bannerUploader"
        onClientUploadComplete={onUploadComplete}
      />
    </ResponsiveDialog>
  );
};
