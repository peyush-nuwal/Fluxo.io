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
} from "../controller/otp.controller.js";

const router = express.Router();

// Auth routes
router.post("/api/v1/auth/signup", signUp);
router.post("/api/v1/auth/signin", signIn);
router.post("/api/v1/auth/signout", signOut);

// password reset routes
router.post("/api/v1/auth/update-password", updatePassword);

// OTP routes
router.post("/api/v1/auth/otp/generate", generateOTP);
router.post("/api/v1/auth/otp/verify", verifyOTPCode);
router.post("/api/v1/auth/otp/resend", resendOTPCode);
router.get("/api/v1/auth/otp/status", getOTPStatusController);
router.get("/api/v1/auth/otp/test-email", testEmailConfig); // Test email configuration
router.delete("/api/v1/auth/otp/cleanup", cleanupOTPs); // Admin utility

export default router;
