import {
  pgTable,
  text,
  timestamp,
  jsonb,
  boolean,
  uuid,
  integer,
} from "drizzle-orm/pg-core";

import { projects } from "../models/index.model.js";

export const diagrams = pgTable("diagrams", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Optional — a diagram can exist standalone
  project_id: uuid("project_id")
    .references(() => projects.id, { onDelete: "set null" })
    .default(null),

  // Owner of the diagram

  user_id: uuid("user_id").notNull(),

  name: text("name").notNull(),

  // JSONB > JSON (indexable, faster)
  data: jsonb("data").notNull(),

  description: text("description"),
  thumbnail_url: text("thumbnail_url"),

  owner_name: text("owner_name"),
  owner_username: text("owner_username"),
  owner_avatar_url: text("owner_avatar_url"),

  // Public visibility toggle
  is_public: boolean("is_public").default(false),

  // Engagement metrics
  views: integer("views").default(0),

  is_active: boolean("is_active").default(true),

  last_opened_at: timestamp("last_opened_at"),

  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
  deleted_at: timestamp("deleted_at"),
});
