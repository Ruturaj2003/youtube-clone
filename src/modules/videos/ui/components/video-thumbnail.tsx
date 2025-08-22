import Image from "next/image";

interface VideoThumbnailProps {
  imageUrl?: string;
}

export const VideoThumbnail = ({ imageUrl }: VideoThumbnailProps) => {
  return (
    <div className="relative">
      {/* Thumnail Wrapper */}
      <div className="relative w-full overflow-hidden rounded-xl aspect-video">
        <Image
          className="size-full object-cover"
          src={imageUrl ?? "/placeholder.svg"}
          alt="Thumbnail"
          fill
        />
      </div>

      {/*TODO:  Video Duration Box */}
    </div>
  );
};
