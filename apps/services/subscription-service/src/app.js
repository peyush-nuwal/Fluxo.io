import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";

import logger from "./config/logger.js";
import subscriptionRoutes from "./routes/index.route.js";

const app = express();

// ---------------------------------------------
// Core Middleware
// ---------------------------------------------
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));
app.use(helmet());

// Request logging
app.use(
  morgan("combined", {
    stream: { write: (msg) => logger.info(msg.trim()) },
  }),
);

// ---------------------------------------------
// Health + Root Endpoints
// ---------------------------------------------
app.get("/", (req, res) => {
  logger.info("Root accessed — subscription service online");
  res.status(200).json({
    message: "Hello from Fluxo.io Subscription Service",
  });
});

app.get("/health", (req, res) => {
  logger.info("Health check — subscription service operational");
  res.status(200).json({
    message: "Subscription service is running",
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get("/api", (req, res) => {
  res.status(200).json({
    message: "Fluxo Subscription API is running",
  });
});

// ---------------------------------------------
// Subscription Routes
// ---------------------------------------------
app.use("/api/v1/subscription", subscriptionRoutes);

// ---------------------------------------------
// 404 Handler
// ---------------------------------------------
app.use((req, res) => {
  logger.warn(`404 — Route not found: ${req.originalUrl}`);
  res.status(404).json({ message: "Route not found" });
});

// ---------------------------------------------
// Global Error Handler
// ---------------------------------------------
app.use((err, req, res, next) => {
  logger.error("Unhandled error:", {
    message: err.message,
    stack: err.stack,
  });

  res.status(500).json({
    message: "Internal Server Error",
  });
});

export default app;
