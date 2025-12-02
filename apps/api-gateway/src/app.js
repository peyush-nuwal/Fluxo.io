import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import logger from "./config/logger.js";

import { verifyToken } from "./middleware/auth.middleware.js";
// import securityMiddleware from "./middleware/security.middleware.js";

import authRoutes from "./routes/auth.route.js";
import aiRoutes from "./routes/ai.route.js";
// import docsRoutes from './routes/docs.route.js'
import diagramRoutes from "./routes/diagram.route.js";
import subscriptionRoutes from "./routes/subscription.route.js";

dotenv.config();

const app = express();

// ------------------------------------
// Global Middleware
// ------------------------------------
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logger
app.use(
  morgan("combined", {
    stream: { write: (message) => logger.info(message.trim()) },
  }),
);

// Optional security middleware
// app.use(securityMiddleware);

// ------------------------------------
// Health Check
// ------------------------------------
app.get("/health", (req, res) => {
  logger.info("Health check — API Gateway operational");
  res.status(200).json({
    message: "API Gateway is running",
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ------------------------------------
// Public Routes
// ------------------------------------
app.use("/api/v1", authRoutes);

// ------------------------------------
// Protected Routes (JWT Required)
// ------------------------------------
app.use("/api/v1", verifyToken, diagramRoutes);
app.use("/api/v1", verifyToken, aiRoutes);
// app.use("/api/v1", verifyToken, docsRoutes);
app.use("/api/v1", verifyToken, subscriptionRoutes);

export default app;
