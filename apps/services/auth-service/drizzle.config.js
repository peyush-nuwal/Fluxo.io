const { defineConfig } = require("drizzle-kit");

module.exports = defineConfig({
  schema: ["./src/models/user.model.js", "./src/models/otp.model.js"],
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
