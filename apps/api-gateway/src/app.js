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

// ----------------------------------------------------
// 1. Global middleware
// ----------------------------------------------------
app.use(helmet());
app.use(cors());
app.use(cookieParser());

app.use(
  morgan("combined", {
    stream: { write: (msg) => console.log(msg.trim()) },
  }),
);

// ----------------------------------------------------
// 2. AUTH MIDDLEWARE (GATEWAY LEVEL)
//    - decides public vs protected
//    - verifies JWT
//    - sets req.authContext
// ----------------------------------------------------
app.use(verifyToken);

// ----------------------------------------------------
// 3. ROUTES (proxy will inject x-user-id)
// ----------------------------------------------------
app.use("/api/v1/auth", authRoutes);

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

// ----------------------------------------------------
// 4. Health
// ----------------------------------------------------
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

export default app;
