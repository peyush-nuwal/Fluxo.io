import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: ["./src/models/user.model.js", "./src/models/otp.model.js"],
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
