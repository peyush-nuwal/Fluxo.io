import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";

import logger from "./config/logger.js";

// routes
import projectRoutes from "./routes/index.js";
import { connectRedis } from "./services/redis.service.js";

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));
app.use(helmet());

connectRedis();
// HTTP request logging with Winston + Morgan
app.use(
  morgan("combined", {
    stream: { write: (message) => logger.info(message.trim()) },
  }),
);

// Root route
app.get("/", (req, res) => {
  logger.info("Hello from diagram service");
  res.status(200).json({ message: "Hello from fluxo.io diagram serivce" });
});

// Base API route
app.get("/api", (req, res) => {
  res.status(200).json({
    message: "fluxo diagram API is running",
  });
});

// project routes
app.use("/", projectRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Global error handler (must have 4 params)
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

export default app;
