import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { projects } from "../models/index.model.js";

export const project_invitations = pgTable("project_invitations", {
  id: uuid("id").primaryKey().defaultRandom(),
  project_id: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  token: text("token").notNull().unique(),
  status: text("status").notNull().default("pending"), // pending, accepted, rejected, expired
  expires_at: timestamp("expires_at").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});
