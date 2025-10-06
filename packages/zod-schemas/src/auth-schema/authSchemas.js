import { z } from "zod";

// ========================================
// Authentication Schemas
// ========================================

/**
 * Sign up validation schema
 */
export const signUpSchema = z.object({
  name: z.string().min(2).max(255).trim(),
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(6).max(128),
});

/**
 * Sign in validation schema
 */
export const signInSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(6).max(128),
});

/**
 * Change password validation schema
 */
export const changePasswordSchema = z.object({
  oldPassword: z.string().min(6).max(128),
  newPassword: z.string().min(6).max(128),
});

// ========================================
// OTP Schemas
// ========================================

/**
 * Generate OTP validation schema
 */
export const generateOTPSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  purpose: z
    .enum(["email_verification", "password_reset", "login", "two_factor"])
    .default("email_verification"),
});

/**
 * Verify OTP validation schema
 */
export const verifyOTPSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  otpCode: z
    .string()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d{6}$/, "OTP must contain only numbers"),
  purpose: z
    .enum(["email_verification", "password_reset", "login", "two_factor"])
    .default("email_verification"),
});

/**
 * Resend OTP validation schema
 */
export const resendOTPSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  purpose: z
    .enum(["email_verification", "password_reset", "login", "two_factor"])
    .default("email_verification"),
});

/**
 * Get OTP status validation schema
 */
export const getOTPStatusSchema = z.object({
  purpose: z
    .enum(["email_verification", "password_reset", "login", "two_factor"])
    .default("email_verification"),
});

// ========================================
// Email Change Schemas
// ========================================

/**
 * Request email change validation schema
 */
export const requestEmailChangeSchema = z.object({
  newEmail: z.string().email().toLowerCase().trim(),
});

/**
 * Verify email change validation schema
 */
export const verifyEmailChangeSchema = z.object({
  newEmail: z.string().email().toLowerCase().trim(),
  otpCode: z
    .string()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d{6}$/, "OTP must contain only numbers"),
});

// ========================================
// Password Reset Schemas
// ========================================

/**
 * Forgot password validation schema
 */
export const forgotPasswordSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
});

/**
 * Verify password reset OTP validation schema
 */
export const verifyPasswordResetOTPSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  otpCode: z
    .string()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d{6}$/, "OTP must contain only numbers"),
});

/**
 * Reset password validation schema
 */
export const resetPasswordSchema = z.object({
  resetToken: z.string().min(1, "Reset token is required"),
  newPassword: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(128, "Password must be less than 128 characters"),
});
