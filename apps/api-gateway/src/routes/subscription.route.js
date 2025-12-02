import express from "express";
import httpProxy from "express-http-proxy";
import { SERVICES } from "../config.js";
import logger from "../config/logger.js";

const router = express.Router();

router.use(
  "/subscription",
  httpProxy(SERVICES.SUBSCRIPTION, {
    proxyReqPathResolver: (req) => {
      logger.info("Subscription proxy path", { url: req.originalUrl });
      return req.originalUrl; // pass through exactly as-is
    },

    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      // Ensure JSON headers stay consistent
      proxyReqOpts.headers["Content-Type"] = "application/json";
      return proxyReqOpts;
    },
  }),
);

export default router;
