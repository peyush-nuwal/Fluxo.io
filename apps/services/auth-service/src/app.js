import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";

import logger from "./config/logger.js";
import authRoutes from "./routes/auth.route.js";
import securityMiddleware from "./middleware/security.middleware.js";

const app = express();

// Middlewares
app.use(
  cors({
    origin: true, // Allow all origins for development
    credentials: true, // Allow cookies
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(helmet());

// HTTP request logging with Winston + Morgan
app.use(
  morgan("combined", {
    stream: { write: (message) => logger.info(message.trim()) },
  }),
);

// arcjet Middleware
app.use(securityMiddleware);

// Root route
app.get("/", (req, res) => {
  logger.info("Hello from auth service");
  res.status(200).json({ message: "Hello from fluxo.io auth serivce" });
});

// Base API route
app.get("/api", (req, res) => {
  res.status(200).json({
    message: "Acquisitions API is running",
  });
});

// Auth routes
app.use("/", authRoutes);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

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
