import {
  pgTable,
  varchar,
  text,
  timestamp,
  json,
  boolean,
} from "drizzle-orm/pg-core";
import { projects } from "./project.model";

const diagrams = pgTable("diagrams", {
  id: varchar("id").primaryKey(),
  project_id: varchar("project_id")
    .notNull()
    .references(() => projects.id),
  name: text("name").notNull(),
  s3_key: text("s3_key"), // link to diagram JSON in S3
  s3_version: text("s3_version").default("1"), // optional versioning
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
  deleted_at: timestamp("deleted_at").default(null),
});
