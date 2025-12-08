import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: [
    "./src/models/diagram.model.js",
    "./src/models/diagram_likes.model.js",
    "./src/models/project.model.js",
    "./src/models/project_invitation.model.js",
  ],
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
