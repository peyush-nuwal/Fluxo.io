import express from "express";
import httpProxy from "express-http-proxy";
import multer from "multer";
import { SERVICES } from "../config.js";
import logger from "../config/logger.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

console.log("upload file api gate file file", upload);

// ------------------------------------------------------
// PUBLIC AUTH ROUTES (NO TOKEN REQUIRED)
// (verifyToken skips these automatically)
// ------------------------------------------------------
router.use(
  [
    "/signup",
    "/signin",
    "/signout",
    "/verify-email",
    "/forgot-password",
    "/reset-password",
  ],
  httpProxy(SERVICES.AUTH, { proxyReqPathResolver: (req) => req.originalUrl }),
);

// ------------------------------------------------------
// FILE UPLOAD ROUTE (multipart/form-data)
// ------------------------------------------------------
router.post(
  "/upload-avatar",
  httpProxy(SERVICES.AUTH, {
    parseReqBody: false,
    proxyReqPathResolver: (req) => req.originalUrl,
    proxyReqOptDecorator: (opts, srcReq) => {
      if (srcReq.headers["x-user-id"])
        opts.headers["x-user-id"] = String(srcReq.headers["x-user-id"]);
      return opts;
    },
  }),
);

// ------------------------------------------------------
// PROTECTED ROUTES (DEFAULT HANDLER)
// ------------------------------------------------------
router.use(
  "/",
  httpProxy(SERVICES.AUTH, {
    proxyReqPathResolver: (req) => req.originalUrl,
    proxyReqOptDecorator: (opts, srcReq) => {
      if (srcReq.headers["x-user-id"])
        opts.headers["x-user-id"] = String(srcReq.headers["x-user-id"]);

      if (srcReq.headers["x-user-email"])
        opts.headers["x-user-email"] = String(srcReq.headers["x-user-email"]);

      return opts;
    },
  }),
);

export default router;
