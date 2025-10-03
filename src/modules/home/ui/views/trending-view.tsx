import { TrendingVideosSection } from "../section/trending-videos-section";

export const TrendingView = () => {
  return (
    <div className="max-w-[2400px] mx-auto mb-10 px-4 pt-2.5 flex flex-col gap-y-6">
      {/* Catgories Section => categoirse Id*/}
      <div className="">
        <h1 className="text-2xl font-bold">Trending</h1>

        <p className="text-xs text-muted-foreground">
          Most Popular Videos Right now !!
        </p>
      </div>
      <TrendingVideosSection />
    </div>
  );
};
