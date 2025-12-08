import { json } from "drizzle-orm/pg-core";
import { pgTable, text, timestamp, uuid, boolean } from "drizzle-orm/pg-core";

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  thumbnail_url: text("thumbnail_url"),
  is_public: boolean("is_public").default(false),
  collaborators: json("collaborators").default([]),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
  deleted_at: timestamp("deleted_at").default(null),
});
