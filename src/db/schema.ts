import { relations } from "drizzle-orm";
import {
  foreignKey,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import {
  createInsertSchema,
  createUpdateSchema,
  createSelectSchema,
} from "drizzle-zod";

export const viedoVisibilty = pgEnum("video_visibilty", ["private", "public"]);

/* ============================
   USERS TABLE
   ============================ */
export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    // External auth provider (Clerk)
    clerkId: text("clerk_id").unique().notNull(),

    name: text("name").notNull(),
    imageUrl: text("image_url").notNull(),
    // TODO: add banner fields (cover image, etc.)

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    // Index for fast lookup by Clerk ID
    uniqueIndex("clerk_id_idx").on(t.clerkId),
  ]
);

/* ============================
   CATEGORIES TABLE
   ============================ */
export const categories = pgTable(
  "categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    name: text("name").notNull().unique(),
    description: text("description"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    // Index for fast lookup by category name
    uniqueIndex("name_idx").on(t.name),
  ]
);

/* ============================
   VIDEOS TABLE
   ============================ */
export const videos = pgTable("videos", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Basic metadata
  title: text("title").notNull(),
  description: text("description"),
  duration: integer("duration"),
  visibility: viedoVisibilty("visibility").default("private").notNull(),

  // Mux integration fields
  muxStatus: text("mux_status"),
  musxAssetId: text("mux_asset_id").unique(),
  muxUploadId: text("mux_upload_id").unique(),
  muxPlaybackId: text("mux_playback_id").unique(),
  muxTrackId: text("mux_track_id").unique(),
  muxTrackStatus: text("mux_track_status"),

  // Media URLs
  thumbnailUrl: text("thumbnail_url"),
  thumbnailKey: text("thumbnail_key"),
  previewUrl: text("preview_url"),
  previewKey: text("preview_key"),

  // Foreign keys
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" }) // Delete videos if user is deleted
    .notNull(),

  categoryId: uuid("category_id").references(() => categories.id, {
    onDelete: "set null", // If category is deleted → videos stay uncategorized
  }),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const videoInsertSchema = createInsertSchema(videos);
export const videoUpdateSchema = createUpdateSchema(videos);
export const videoSelectSchema = createSelectSchema(videos);

/* ============================
   VIDEO VIEWS TABLE
   ============================ */

export const videoViews = pgTable(
  "video_views",
  {
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),

    videoId: uuid("video_id")
      .references(() => videos.id, {
        onDelete: "cascade",
      })
      .notNull(),

    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    primaryKey({
      name: "videos_views_pk",
      columns: [table.userId, table.videoId],
    }),
  ]
);

// Schemas for video_views
export const videoViewInsertSchema = createInsertSchema(videoViews);
export const videoViewUpdateSchema = createUpdateSchema(videoViews);
export const videoViewSelectSchema = createSelectSchema(videoViews);

/* ============================
   VIDEO REACTIONS TABLE
   ============================ */

export const reactionType = pgEnum("reaction_type", ["like", "dislike"]);

export const videoReactions = pgTable(
  "video_reactions",
  {
    userId: uuid("user_id")
      .references(() => users.id, {
        onDelete: "cascade",
      })
      .notNull(),
    videoId: uuid("video_id")
      .references(() => videos.id, {
        onDelete: "cascade",
      })
      .notNull(),
    type: reactionType("type").notNull(),

    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    primaryKey({
      name: "video_reactions_pk",
      columns: [table.userId, table.videoId],
    }),
  ]
);

export const videoReactionInsertSchema = createInsertSchema(videoReactions);
export const videoReactionUpdateSchema = createUpdateSchema(videoReactions);
export const videoReactionSelectSchema = createSelectSchema(videoReactions);

/* ============================
   VIDEO SUBSCRIPTIONS TABLE
   ============================ */

export const subscriptions = pgTable(
  "subscriptions",
  {
    viewerId: uuid("viewer_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    creatorId: uuid("creator_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),

    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    primaryKey({
      name: "subscriptions_pk",
      columns: [table.viewerId, table.creatorId],
    }),
  ]
);

/* ============================
   VIDEO COMMENTS TABLE
   ============================ */

export const comments = pgTable(
  "comments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    parentId: uuid("parent_id"),
    userId: uuid("user_id")
      .references(() => users.id, {
        onDelete: "cascade",
      })
      .notNull(),

    videoId: uuid("video_id")
      .references(() => videos.id, { onDelete: "cascade" })
      .notNull(),
    value: text("value").notNull(),

    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => {
    return [
      foreignKey({
        columns: [table.parentId],
        foreignColumns: [table.id],
        name: "comments_parent_id_fkey",
      }).onDelete("cascade"),
    ];
  }
);
export const commentsInsertSchema = createInsertSchema(comments);
export const commentsUpdateSchema = createUpdateSchema(comments);
export const commentsSelectSchema = createSelectSchema(comments);

/* ============================
   VIDEO COMMENTS REACTIONS TABLE
   ============================ */

export const commentReactions = pgTable(
  "comment_reactions",
  {
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    commentId: uuid("comment_id")
      .references(() => comments.id, { onDelete: "cascade" })
      .notNull(),
    type: reactionType("type").notNull(),

    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    primaryKey({
      name: "comment_reactions_pk",
      columns: [table.userId, table.commentId],
    }),
  ]
);

/* ============================
  PLAYLIST TABLE
   ============================ */
export const playlists = pgTable("playlists", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/* ============================
   PLAYLIST VIDEOS TABLE
   ============================ */

export const playlistVideos = pgTable(
  "playlist_videos",
  {
    playlistId: uuid("playlist_id")
      .references(() => playlists.id, { onDelete: "cascade" })
      .notNull(),

    videoId: uuid("video_id")
      .references(() => videos.id, {
        onDelete: "cascade",
      })
      .notNull(),

    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    primaryKey({
      name: "playlist_videos_pk",
      columns: [table.playlistId, table.videoId],
    }),
  ]
);

/* ============================
   RELATIONSHIPS
   ============================ */

// One user → many videos, views, reactions, and subscriptions
export const userRelations = relations(users, ({ many }) => ({
  videos: many(videos), // A user can upload many videos
  views: many(videoViews), // A user can view many videos
  videoReactions: many(videoReactions), // A user can react to many videos
  subscriptions: many(subscriptions, {
    relationName: "subscriptions_viewer_id_fkey",
  }), // A user can subscribe to many creators
  subscribers: many(subscriptions, {
    relationName: "subscriptions_creator_id_fkey",
  }), // A user can have many subscribers
  comments: many(comments),
  commentReactions: many(commentReactions),
  playlists: many(playlists),
}));

// One category → many videos
export const categoryRelations = relations(categories, ({ many }) => ({
  videos: many(videos), // A category can have many videos
}));

// One video → one user (uploader), one category, many views, many reactions
export const videoRelations = relations(videos, ({ one, many }) => ({
  user: one(users, {
    fields: [videos.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [videos.categoryId],
    references: [categories.id],
  }),
  views: many(videoViews), // A video can have many views
  videoReactions: many(videoReactions), // A video can have many reactions
  comments: many(comments),
  playlistVideos: many(playlistVideos),
}));

// One video view → one user, one video
export const videoViewRelations = relations(videoViews, ({ one }) => ({
  user: one(users, {
    fields: [videoViews.userId],
    references: [users.id],
  }),
  video: one(videos, {
    fields: [videoViews.videoId],
    references: [videos.id],
  }),
}));

// One subscription → one viewer, one creator
export const subscriptionRelations = relations(subscriptions, ({ one }) => ({
  viewer: one(users, {
    fields: [subscriptions.viewerId],
    references: [users.id],
    relationName: "subscriptions_viewer_id_fkey",
  }),
  creator: one(users, {
    fields: [subscriptions.creatorId],
    references: [users.id],
    relationName: "subscriptions_creator_id_fkey",
  }),
}));

// One video reaction → one user, one video
export const videoReactionRelations = relations(videoReactions, ({ one }) => ({
  user: one(users, {
    fields: [videoReactions.userId],
    references: [users.id],
  }),
  video: one(videos, {
    fields: [videoReactions.videoId],
    references: [videos.id],
  }),
}));

// One comment → one user, one video
export const commentRelations = relations(comments, ({ one, many }) => {
  return {
    user: one(users, {
      fields: [comments.userId],
      references: [users.id],
    }),
    video: one(videos, {
      fields: [comments.videoId],
      references: [videos.id],
    }),
    reactions: many(commentReactions),
    parent: one(comments, {
      fields: [comments.parentId],
      references: [comments.id],
      relationName: "comments_parent_id_fkey",
    }),
    replies: many(comments, {
      relationName: "comments_parent_id_fkey",
    }),
  };
});

// One commentReact -> one user , one commet ig
export const commentReactionRelations = relations(
  commentReactions,
  ({ one }) => ({
    user: one(users, {
      fields: [commentReactions.userId],
      references: [users.id],
    }),
    comment: one(comments, {
      fields: [commentReactions.commentId],
      references: [comments.id],
    }),
  })
);

// Play list video Relations

export const playlistVideoRelations = relations(playlistVideos, ({ one }) => ({
  playlist: one(playlists, {
    fields: [playlistVideos.playlistId],
    references: [playlists.id],
  }),
  video: one(videos, {
    fields: [playlistVideos.videoId],
    references: [videos.id],
  }),
}));

export const playlistRelation = relations(playlists, ({ one, many }) => ({
  user: one(users, {
    fields: [playlists.userId],
    references: [users.id],
  }),
  playlistVideos: many(playlistVideos),
}));
