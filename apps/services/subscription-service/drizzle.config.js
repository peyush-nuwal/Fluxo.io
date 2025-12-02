import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: ["./src/models/subscription.model.js"],
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
