import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import { verifyToken } from "./middleware/auth.middleware.js";

import authRoutes from "./routes/auth.route.js";
import diagramRoutes from "./routes/diagram.route.js";
import aiRoutes from "./routes/ai.route.js";

import subscriptionRoutes from "./routes/subscription.route.js";

const app = express();

// -----------------------------
// Global middleware
// -----------------------------
app.use(helmet());

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);

app.use(cookieParser());

app.use(
  morgan("combined", {
    stream: { write: (msg) => console.log(msg.trim()) },
  }),
);

// -----------------------------
// AUTH GATE (CRITICAL FIX)
// -----------------------------
app.use((req, res, next) => {
  if (req.path.startsWith("/api/v1/auth")) {
    return next(); // auth service owns auth
  }
  return verifyToken(req, res, next);
});

// -----------------------------
// ROUTES
// -----------------------------
app.use(
  "/api/v1/auth",
  express.json(),
  express.urlencoded({ extended: true }),
  authRoutes,
);

app.use(
  "/api/v1/diagram",
  express.json(),
  express.urlencoded({ extended: true }),
  diagramRoutes,
);

app.use(
  "/api/v1/ai",
  express.json(),
  express.urlencoded({ extended: true }),
  aiRoutes,
);

app.use(
  "/api/v1/subscription",
  express.json(),
  express.urlencoded({ extended: true }),
  subscriptionRoutes,
);

// -----------------------------
// Health
// -----------------------------
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

export default app;
