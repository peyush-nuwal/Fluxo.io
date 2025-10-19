import {
  pgTable,
  text,
  timestamp,
  varchar,
  boolean,
} from "drizzle-orm/pg-core";

const users = pgTable("users", {
  id: varchar("id").primaryKey(), // you can generate UUID in service
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password"), // can be null for OAuth
  auth_provider: text("auth_provider").notNull(), // "local" / "google" / "github"
  google_id: text("google_id").unique(), // OAuth ID
  github_id: text("github_id").unique(),
  email_verified: boolean("email_verified").default(false).notNull(), // Email verification status
  created_at: timestamp("created_at").defaultNow(),
});

export default users;
