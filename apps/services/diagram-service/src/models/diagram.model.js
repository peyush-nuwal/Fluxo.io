import {
  pgTable,
  text,
  timestamp,
  json,
  boolean,
  uuid,
} from "drizzle-orm/pg-core";
import projects from "./project.model.js";

export const diagrams = pgTable("diagrams", {
  id: uuid("id").primaryKey().defaultRandom(), // better than varchar for IDs
  project_id: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  data: json("data").notNull(), // lowercase json ✅
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
  deleted_at: timestamp("deleted_at"),
});
