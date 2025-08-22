import { relations } from "drizzle-orm";
import {
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

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

  // Mux integration fields
  muxStatus: text("mux_status"),
  musxAssetId: text("mux_asset_id").unique(),
  muxUploadId: text("mux_upload_id").unique(),
  muxPlaybackId: text("mux_playback_id").unique(),
  muxTrackId: text("mux_track_id").unique(),
  muxTrackStatus: text("mux_track_status"),

  // Media URLs
  thumbnailUrl: text("thumbnail_url"),
  previewUrl: text("preview_url"),

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

/* ============================
   RELATIONSHIPS
   ============================ */

// One user → many videos
export const userRelations = relations(users, ({ many }) => ({
  videos: many(videos),
}));

// One category → many videos
export const categoryRelations = relations(categories, ({ many }) => ({
  videos: many(videos),
}));

// One video → one user, one category
export const videoRelations = relations(videos, ({ one }) => ({
  user: one(users, {
    fields: [videos.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [videos.categoryId],
    references: [categories.id],
  }),
}));
