import express from "express";
import httpProxy from "express-http-proxy";
import { SERVICES } from "../config.js";

const router = express.Router();

// forward all /auth requests to auth-service with full path preservation
router.use(
  "/auth",
  httpProxy(SERVICES.AUTH, {
    proxyReqPathResolver: (req) => {
      return req.originalUrl; // Preserve the full original URL
    },
  }),
);

export default router;
