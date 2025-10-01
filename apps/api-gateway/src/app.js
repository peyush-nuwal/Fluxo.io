import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import logger from "./config/logger.js";

import { verifyToken } from "./middleware/auth.middleware.js";
import securityMiddleware from "./middleware/security.middleware.js";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import docsRoutes from "./routes/docsRoutes.js";

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// HTTP request logging with Winston + Morgan
app.use(
  morgan("combined", {
    stream: { write: (message) => logger.info(message.trim()) },
  }),
);

// Arcjet security middleware (rate limiting, bot detection, shield)
app.use(securityMiddleware);

// Health check
app.get("/health", (req, res) => {
  logger.info("Hello from fluxo api gateway");
  res.status(200).json({
    message: "API Gateway is running",
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API v1 routes (public - no auth required)
app.use("/api/v1", authRoutes);

// API v1 routes (protected - auth required)
app.use("/api/v1/users", verifyToken, userRoutes);
app.use("/api/v1/docs", verifyToken, docsRoutes);

export default app;
