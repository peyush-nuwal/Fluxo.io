import express from "express";
import httpProxy from "express-http-proxy";
import multer from "multer";
import { SERVICES } from "../config.js";

const router = express.Router();

// ------------------------------------------------------
// PUBLIC AUTH ROUTES (NO AUTH REQUIRED)
// ------------------------------------------------------
router.use(
  [
    "/api/v1/auth/signup",
    "/api/v1/auth/signin",
    "/api/v1/auth/signout",
    "/api/v1/auth/verify-email",
    "/api/v1/auth/forgot-password",
    "/api/v1/auth/reset-password",
  ],
  httpProxy(SERVICES.AUTH, {
    proxyReqPathResolver: (req) => req.originalUrl,
  }),
);

// ------------------------------------------------------
// FILE UPLOAD (AUTH REQUIRED)
// ------------------------------------------------------
router.post(
  "/upload-avatar",
  httpProxy(SERVICES.AUTH, {
    parseReqBody: false,
    proxyReqPathResolver: (req) => req.originalUrl,
    proxyReqOptDecorator: (opts, srcReq) => {
      if (srcReq.authContext?.userId) {
        opts.headers["x-user-id"] = srcReq.authContext.userId;
      }
      return opts;
    },
  }),
);

// ------------------------------------------------------
// ALL OTHER AUTH ROUTES (AUTH REQUIRED)
// ------------------------------------------------------
router.use(
  "/",
  httpProxy(SERVICES.AUTH, {
    proxyReqPathResolver: (req) => req.originalUrl,
    proxyReqOptDecorator: (opts, srcReq) => {
      if (srcReq.authContext?.userId) {
        opts.headers["x-user-id"] = srcReq.authContext.userId;
      }
      return opts;
    },
  }),
);

export default router;
