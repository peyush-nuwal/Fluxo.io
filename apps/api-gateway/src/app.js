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
// 1. Global middleware (gateway level)
// ----------------------------------------------------
app.use(helmet());
app.use(cors());
app.use(cookieParser());

app.use(
  morgan("combined", {
    stream: { write: (msg) => console.log(msg.trim()) },
  }),
);

app.use("/api/v1/auth", authRoutes);
app.use(verifyToken);

// ----------------------------------------------------
// 3. JSON Body parsing ONLY for non-file routes
// ----------------------------------------------------
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
// 4. AUTH SERVICE
//    - signup/signin → public
//    - upload-avatar → file upload, NO JSON
// ----------------------------------------------------

// ----------------------------------------------------
// 5. Health Check
// ----------------------------------------------------
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

export default app;
