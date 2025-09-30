import express from "express";
import { verifyToken } from "./middleware/auth.middleware.js";

import authRoutes from "./routes/authRoutes.js";

const app = express();

// Health check
app.get("/health", (req, res) => res.send("API Gateway up 🚀"));

// Apply auth middleware globally
app.use(verifyToken);

// Routes
app.use("/auth", authRoutes);

export default app;
