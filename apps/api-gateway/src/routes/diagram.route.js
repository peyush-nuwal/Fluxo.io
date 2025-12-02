import httpProxy from "express-http-proxy";
import { SERVICES } from "../config.js";
import logger from "../config/logger.js";
import { Router } from "express";

const router = Router();

// Forward all /user requests to user-service
router.use(
  "/projects",
  httpProxy(SERVICES.DIAGRAM, {
    proxyReqPathResolver: (req) => {
      logger.info("Proxy request path resolver", req.originalUrl);
      return req.originalUrl; // Preserve the full original URL
    },
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      // Forward user information as headers
      if (srcReq.user) {
        proxyReqOpts.headers["X-User-Id"] = srcReq.user.id;
        proxyReqOpts.headers["X-User-Email"] = srcReq.user.email;
      }
      return proxyReqOpts;
    },
  }),
);

export default router;
