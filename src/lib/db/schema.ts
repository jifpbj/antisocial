import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const platforms = sqliteTable("platforms", {
  id: text("id").primaryKey(),
  displayName: text("display_name").notNull(),
  credentialsEncrypted: text("credentials_encrypted"),
  credentialsIv: text("credentials_iv"),
  credentialsTag: text("credentials_tag"),
  isConnected: integer("is_connected", { mode: "boolean" })
    .notNull()
    .default(false),
  lastVerifiedAt: text("last_verified_at"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const posts = sqliteTable("posts", {
  id: text("id").primaryKey(),
  content: text("content").notNull(),
  createdAt: text("created_at").notNull(),
});

export const postResults = sqliteTable("post_results", {
  id: text("id").primaryKey(),
  postId: text("post_id")
    .notNull()
    .references(() => posts.id),
  platformId: text("platform_id")
    .notNull()
    .references(() => platforms.id),
  status: text("status", {
    enum: ["success", "failure", "skipped", "manual"],
  }).notNull(),
  externalId: text("external_id"),
  externalUrl: text("external_url"),
  errorMessage: text("error_message"),
  createdAt: text("created_at").notNull(),
});
