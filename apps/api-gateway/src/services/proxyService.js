import httpProxy from "express-http-proxy";
import logger from "../config/logger.js";

export const createProxy = (serviceUrl) => {
  return httpProxy(serviceUrl, {
    // Preserve the full original request path
    proxyReqPathResolver: (req) => {
      const resolved = req.originalUrl;
      logger.info("Proxy path resolved", {
        target: serviceUrl,
        resolvedPath: resolved,
      });
      return resolved;
    },

    // Ensure JSON headers and pass-through cookies
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      proxyReqOpts.headers = {
        ...proxyReqOpts.headers,
        "Content-Type": "application/json",
      };
      return proxyReqOpts;
    },

    // Log upstream response status
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
      logger.info("Upstream response", {
        target: serviceUrl,
        status: proxyRes.statusCode,
      });

      // Automatically forward JSON bodies as-is
      const isJson =
        proxyRes.headers["content-type"]?.includes("application/json");

      return isJson ? proxyResData : proxyResData.toString("utf8");
    },

    // Error handler
    proxyErrorHandler: (err, res, next) => {
      logger.error("Proxy error", {
        serviceUrl,
        message: err.message,
        code: err.code,
      });

      res.status(502).json({
        message: "Target service unavailable",
        service: serviceUrl,
        code: err.code || "PROXY_ERROR",
      });
    },
  });
};
