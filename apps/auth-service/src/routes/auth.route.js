import express from "express";
import {
  signUp,
  signIn,
  signOut,
  updatePassword,
} from "../controller/auth.controller.js";
import {
  generateOTP,
  verifyOTPCode,
  resendOTPCode,
  getOTPStatusController,
  cleanupOTPs,
  testEmailConfig,
  requestEmailChange,
  verifyEmailChange,
  forgotPassword,
  verifyPasswordResetOTP,
  resetPassword,
} from "../controller/otp.controller.js";
import passport from "../config/passport.js";
import { jwttoken } from "../utils/jwt.js";
const router = express.Router();

// ========================================
// Authentication Routes
// ========================================
router.post("/api/v1/auth/signup", signUp);
router.post("/api/v1/auth/signin", signIn);
router.post("/api/v1/auth/signout", signOut);

// ========================================
// Password Management Routes
// ========================================
router.post("/api/v1/auth/update-password", updatePassword);

// ========================================
// OTP Management Routes
// ========================================
router.post("/api/v1/auth/otp/generate", generateOTP);
router.post("/api/v1/auth/otp/verify", verifyOTPCode);
router.post("/api/v1/auth/otp/resend", resendOTPCode);
router.get("/api/v1/auth/otp/status", getOTPStatusController);
router.get("/api/v1/auth/otp/test-email", testEmailConfig); // Test email configuration
router.delete("/api/v1/auth/otp/cleanup", cleanupOTPs); // Admin utility

// ========================================
// Email Change Routes (OTP-based)
// ========================================
router.post("/api/v1/auth/email/change/request", requestEmailChange);
router.post("/api/v1/auth/email/change/verify", verifyEmailChange);

// ========================================
// Password Reset Routes (OTP-based)
// ========================================
router.post("/api/v1/auth/password/forgot-password", forgotPassword);
router.post(
  "/api/v1/auth/password/verify-reset-password-otp",
  verifyPasswordResetOTP,
);
router.post("/api/v1/auth/password/reset", resetPassword);

// o auth service
// Google OAuth
// Google OAuth
router.get(
  "/api/v1/auth/oauth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);

router.get(
  "/api/v1/auth/oauth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  (req, res) => {
    const token = jwttoken.sign(req.user); // make sure your user object has this
    res.redirect(`${process.env.FRONTEND_URL}/oauth-success?token=${token}`);
  },
);

// GitHub OAuth
router.get(
  "/api/v1/auth/oauth/github",
  passport.authenticate("github", { scope: ["user:email"], session: false }),
);

router.get(
  "/api/v1/auth/oauth/github/callback",
  passport.authenticate("github", {
    failureRedirect: "/login",
    session: false,
  }),
  (req, res) => {
    const token = jwttoken.sign(req.user);
    res.redirect(`${process.env.FRONTEND_URL}/oauth-success?token=${token}`);
  },
);

export default router;
