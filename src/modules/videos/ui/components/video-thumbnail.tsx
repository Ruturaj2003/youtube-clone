import Image from "next/image";

interface VideoThumbnailProps {
  imageUrl?: string | null;
  previewUrl?: string | null;
  title: string;
}

export const VideoThumbnail = ({
  imageUrl,
  previewUrl,
  title,
}: VideoThumbnailProps) => {
  return (
    <div className="relative group">
      {/* Thumnail Wrapper */}
      <div className="relative w-full overflow-hidden rounded-xl aspect-video">
        <Image
          className="size-full object-cover group-hover:opacity-0"
          src={imageUrl ?? "/placeholder.svg"}
          alt={title}
          fill
        />
        <Image
          className="size-full opacity-0 object-cover group-hover:opacity-100"
          src={previewUrl ?? "/placeholder.svg"}
          alt={title}
          fill
        />
      </div>

      {/*TODO:  Video Duration Box */}
    </div>
  );
};
