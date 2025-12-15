import {
  pgTable,
  text,
  timestamp,
  varchar,
  boolean,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: varchar("id").primaryKey(), // you can generate UUID in service
  name: text("name").notNull(),

  // Unique handle (public username)
  user_name: text("user_name").unique(),

  email: text("email").notNull().unique(),
  password: text("password"), // can be null for OAuth

  is_profile_public: boolean("is_profile_public").default(false),

  auth_provider: text("auth_provider").notNull(), // "local" / "google" / "github"
  google_id: text("google_id").unique(), // OAuth ID
  github_id: text("github_id").unique(),
  avatar_url: text("avatar_url"), // <--- fixed
  email_verified: boolean("email_verified").default(false).notNull(), // Email verification status
  created_at: timestamp("created_at").defaultNow(),
});
