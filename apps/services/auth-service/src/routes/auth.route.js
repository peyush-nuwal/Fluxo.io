import express from "express";
import {
  signUp,
  signIn,
  signOut,
  updatePassword,
  refresh,
  me,
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
import multer from "multer";
import {
  uploadAvatarController,
  changeProfileVisibilityController,
  getUserProfile,
  getUserPublicProfile,
  updateUserProfileController,
} from "../controller/user.controller.js";

// ========================================
// Authentication Routes
// ========================================
router.post("/signup", signUp);
router.post("/signin", signIn);
router.post("/signout", signOut);

router.get("/me", me);
router.get("/refresh", refresh);

// ========================================
// Password Management Routes
// ========================================
router.post("/update-password", updatePassword);

// ========================================
// OTP Management Routes
// ========================================
router.post("/otp/generate", generateOTP);
router.post("/otp/verify", verifyOTPCode);
router.post("/otp/resend", resendOTPCode);
router.get("/otp/status", getOTPStatusController);
router.get("/otp/test-email", testEmailConfig); // Test email configuration
router.delete("/otp/cleanup", cleanupOTPs); // Admin utility

// ========================================
// Email Change Routes (OTP-based)
// ========================================
router.post("/email/change/request", requestEmailChange);
router.post("/email/change/verify", verifyEmailChange);

// ========================================
// Password Reset Routes (OTP-based)
// ========================================
router.post("/password/forgot-password", forgotPassword);
router.post("/password/verify-reset-password-otp", verifyPasswordResetOTP);
router.post("/password/reset", resetPassword);

// o auth service
// Google OAuth
// Google OAuth
router.get(
  "/oauth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);

router.get(
  "/oauth/google/callback",
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
  "/oauth/github",
  passport.authenticate("github", { scope: ["user:email"], session: false }),
);

router.get(
  "/oauth/github/callback",
  passport.authenticate("github", {
    failureRedirect: "/login",
    session: false,
  }),
  (req, res) => {
    const token = jwttoken.sign(req.user);
    res.redirect(`${process.env.FRONTEND_URL}/oauth-success?token=${token}`);
  },
);

// -------------avatar upload ---------------

const upload = multer({ storage: multer.memoryStorage() });

console.log("upload file route file", upload);

router.get("/users/me", getUserProfile);
router.patch("/users/me", upload.single("avatar"), updateUserProfileController);
router.get("/users/:id/profile", getUserPublicProfile);

router.post(
  "/users/me/upload-avatar",
  upload.single("avatar"),
  uploadAvatarController,
);

router.patch("/users/me/visibility", changeProfileVisibilityController);

export default router;
