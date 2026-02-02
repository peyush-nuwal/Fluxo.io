import express from "express";
import httpProxy from "express-http-proxy";
import { SERVICES } from "../config.js";

const router = express.Router();

// Public auth routes (NO JWT REQUIRED)
const PUBLIC_ROUTES = [
  "/signup",
  "/signin",
  "/logout",
  "/otp/verify",
  "/forgot-password",
  "/reset-password",
];

// Shared proxy for auth service
const authProxy = httpProxy(SERVICES.AUTH, {
  proxyReqPathResolver: (req) => req.originalUrl,

  proxyReqOptDecorator: (opts, srcReq) => {
    if (srcReq.headers.cookie) {
      opts.headers.cookie = srcReq.headers.cookie;
    }
    return opts;
  },

  userResDecorator: (proxyRes, proxyResData, _userReq, userRes) => {
    if (proxyRes.headers["set-cookie"]) {
      userRes.setHeader("Set-Cookie", proxyRes.headers["set-cookie"]);
    }
    return proxyResData;
  },
});

// -----------------------------
// PUBLIC AUTH ROUTES
// -----------------------------
PUBLIC_ROUTES.forEach((route) => {
  router.use(route, authProxy);
});

// -----------------------------
// PROTECTED AUTH ROUTES
// -----------------------------
router.use("/", authProxy);

export default router;
