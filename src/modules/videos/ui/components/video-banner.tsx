import { VideoGetOneOutput } from "../../types";
interface VideoBannerProps {
  status: VideoGetOneOutput["muxStatus"];
}
export const VideoBanner = ({ status }: VideoBannerProps) => {
  return <div className="">{status}</div>;
};
