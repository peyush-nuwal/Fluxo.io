import httpProxy from "express-http-proxy";
import { SERVICES } from "../config.js";
import logger from "../config/logger.js";
import { Router } from "express";

// diagram routes
const router = Router();

const proxyOptions = {
  proxyReqPathResolver: (req) => {
    const upstreamPath = req.originalUrl.replace(
      /^\/api\/v1\/diagram/,
      "/api/v1",
    );
    logger.info("Proxy request path resolver", {
      originalUrl: req.originalUrl,
      upstreamPath,
    });
    return upstreamPath;
  },
  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    const userId = srcReq.authContext?.userId || srcReq.user?.id;
    const userEmail = srcReq.authContext?.email || srcReq.user?.email;

    if (userId) {
      proxyReqOpts.headers["X-User-Id"] = userId;
    }
    if (userEmail) {
      proxyReqOpts.headers["X-User-Email"] = userEmail;
    }
    return proxyReqOpts;
  },
};

// FOR PROJECT ROUTES
router.use("/projects", httpProxy(SERVICES.DIAGRAM, proxyOptions));

// FOR DIAGRAM ROUTES
router.use("/diagrams", httpProxy(SERVICES.DIAGRAM, proxyOptions));

export default router;
