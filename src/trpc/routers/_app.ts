import { categoriesRouter } from "@/modules/categories/server/procedures";
import { createTRPCRouter } from "../init";
import { studioRouter } from "@/modules/studio/server/procedures";
import { videosRouter } from "@/modules/videos/server/procedures";
import { videoViewsRouter } from "@/modules/video-views/server/procedures";
import { videoReactionsRouter } from "@/modules/video-reactions/server/procedures";
import { videoSubscriptionsRouter } from "@/modules/subscriptions/server/procedures";
import { commentsRouter } from "@/modules/comments/server/procedures";
import { commentReactionsRouter } from "@/modules/comment-reactions/server/procedures";
import { suggestionsRouter } from "@/modules/suggestions/server/procedures";
import { searchRouter } from "@/modules/search/server/procedure";
import { playlistsRouter } from "@/modules/playlists/server/procedure";

export const appRouter = createTRPCRouter({
  categories: categoriesRouter,
  comments: commentsRouter,
  commentReactions: commentReactionsRouter,
  playlists: playlistsRouter,
  search: searchRouter,
  studio: studioRouter,
  suggestions: suggestionsRouter,
  subscriptions: videoSubscriptionsRouter,
  videos: videosRouter,
  videoViews: videoViewsRouter,
  videoReactions: videoReactionsRouter,
});

// Export type definition of API
export type AppRouter = typeof appRouter;
