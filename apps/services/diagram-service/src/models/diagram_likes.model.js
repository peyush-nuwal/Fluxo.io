import { pgTable, uuid, timestamp, unique } from "drizzle-orm/pg-core";
import { diagrams } from "../models/index.model.js";

export const diagram_likes = pgTable(
  "diagram_likes",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    diagram_id: uuid("diagram_id")
      .notNull()
      .references(() => diagrams.id, { onDelete: "cascade" }),

    user_id: uuid("user_id").notNull(),

    created_at: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    diagramLikeUnique: unique("diagram_like_unique").on(
      table.diagram_id,
      table.user_id,
    ),
  }),
);
