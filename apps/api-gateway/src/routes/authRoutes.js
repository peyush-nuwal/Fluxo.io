import express from "express";
import httpProxy from "express-http-proxy";
import { SERVICES } from "../config.js";
import logger from "../config/logger.js";
const router = express.Router();

// forward all /auth requests to auth-service with full path preservation
router.use(
  "/auth",
  httpProxy(SERVICES.AUTH, {
    proxyReqPathResolver: (req) => {
      logger.info("Proxy request path resolver", req.originalUrl);
      return req.originalUrl; // Preserve the full original URL
    },
  }),
);

export default router;
