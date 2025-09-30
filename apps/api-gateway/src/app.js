import express from "express";
import cors from "cors";
import { verifyToken } from "./middleware/auth.middleware.js";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import docsRoutes from "./routes/docsRoutes.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (req, res) => {
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
