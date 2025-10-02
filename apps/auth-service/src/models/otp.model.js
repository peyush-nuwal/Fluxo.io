import { pgTable, text, timestamp, varchar, integer, boolean } from "drizzle-orm/pg-core";

const otps = pgTable("otps", {
  id: varchar("id").primaryKey(), // UUID
  user_id: varchar("user_id").notNull(), // Foreign key to users table
  email: text("email").notNull(),
  otp_code: varchar("otp_code", { length: 6 }).notNull(), // 6-digit OTP
  purpose: text("purpose").notNull(), // "email_verification", "password_reset", "login", etc.
  expires_at: timestamp("expires_at").notNull(),
  is_used: boolean("is_used").default(false).notNull(),
  attempts: integer("attempts").default(0).notNull(), // Track verification attempts
  created_at: timestamp("created_at").defaultNow().notNull(),
  used_at: timestamp("used_at"), // When OTP was successfully used
});

export default otps;
