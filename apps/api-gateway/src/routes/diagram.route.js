import httpProxy from "express-http-proxy";
import { SERVICES } from "../config.js";
import logger from "../config/logger.js";
import { Router } from "express";

const router = Router();

const proxyOptions = {
  proxyReqPathResolver: (req) => {
    logger.info("Proxy request path resolver", req.originalUrl);
    return req.originalUrl; // forward full path
  },
  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    if (srcReq.user) {
      proxyReqOpts.headers["X-User-Id"] = srcReq.user.id;
      proxyReqOpts.headers["X-User-Email"] = srcReq.user.email;
    }
    return proxyReqOpts;
  },
};

// FOR PROJECT ROUTES
router.use("/projects", httpProxy(SERVICES.DIAGRAM, proxyOptions));

// FOR DIAGRAM ROUTES
router.use("/diagrams", httpProxy(SERVICES.DIAGRAM, proxyOptions));

export default router;
