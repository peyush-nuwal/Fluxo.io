import { z } from "zod";

// ========================================
// Authentication Schemas
// ========================================

/**
 * Sign up validation schema
 */

export const signUpSchema = z.object({
  userName: z
    .string({ error: "Username is required" })
    .trim()
    .min(2, { error: "Username must be at least 2 characters" })
    .max(255, { error: "Username is too long" })
    .regex(/^(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+[a-zA-Z0-9]$/, {
      error:
        "Username may contain letters, numbers, dots and underscores, and cannot start or end with dot or underscore",
    }),

  name: z
    .string({ error: "Name is required" })
    .trim()
    .min(2, { error: "Name must be at least 2 characters" })
    .max(255, { error: "Name is too long" }),

  email: z
    .string({ error: "Email is required" })
    .trim()
    .toLowerCase()
    .email({ error: "Invalid email address" }),

  password: z
    .string({ error: "Password is required" })
    .min(6, { error: "Password must be at least 6 characters" }),
});

/* =====================================================
   AUTH SCHEMAS
===================================================== */

/**
 * Sign In
 */
export const signInSchema = z.object({
  email: z
    .string({ error: "Email is required" })
    .trim()
    .toLowerCase()
    .email({ error: "Invalid email address" }),

  password: z
    .string({ error: "Password is required" })
    .min(6, { error: "Password must be at least 6 characters" }),
});

/**
 * Change Password
 */
export const changePasswordSchema = z.object({
  oldPassword: z
    .string({ error: "Old password is required" })
    .min(6, { error: "Old password must be at least 6 characters" }),

  newPassword: z
    .string({ error: "New password is required" })
    .min(6, { error: "New password must be at least 6 characters" }),
});

/* =====================================================
   OTP SCHEMAS
===================================================== */

/**
 * Generate OTP
 */
export const generateOTPSchema = z.object({
  email: z
    .string({ error: "Email is required" })
    .trim()
    .toLowerCase()
    .email({ error: "Invalid email address" }),

  purpose: z
    .enum(["email_verification", "password_reset", "login", "two_factor"])
    .default("email_verification"),
});

/**
 * Verify OTP
 */
export const verifyOTPSchema = z.object({
  email: z
    .string({ error: "Email is required" })
    .trim()
    .toLowerCase()
    .email({ error: "Invalid email address" }),

  otpCode: z
    .string({ error: "OTP is required" })
    .length(6, { error: "OTP must be exactly 6 digits" })
    .regex(/^\d{6}$/, { error: "OTP must contain only numbers" }),

  purpose: z
    .enum(["email_verification", "password_reset", "login", "two_factor"])
    .default("email_verification"),
});

/**
 * Resend OTP
 */
export const resendOTPSchema = z.object({
  email: z
    .string({ error: "Email is required" })
    .trim()
    .toLowerCase()
    .email({ error: "Invalid email address" }),

  purpose: z
    .enum(["email_verification", "password_reset", "login", "two_factor"])
    .default("email_verification"),
});

/**
 * Get OTP Status
 */
export const getOTPStatusSchema = z.object({
  purpose: z
    .enum(["email_verification", "password_reset", "login", "two_factor"])
    .default("email_verification"),
});

/* =====================================================
   EMAIL CHANGE SCHEMAS
===================================================== */

/**
 * Request Email Change
 */
export const requestEmailChangeSchema = z.object({
  newEmail: z
    .string({ error: "New email is required" })
    .trim()
    .toLowerCase()
    .email({ error: "Invalid email address" }),
});

/**
 * Verify Email Change
 */
export const verifyEmailChangeSchema = z.object({
  newEmail: z
    .string({ error: "New email is required" })
    .trim()
    .toLowerCase()
    .email({ error: "Invalid email address" }),

  otpCode: z
    .string({ error: "OTP is required" })
    .length(6, { error: "OTP must be exactly 6 digits" })
    .regex(/^\d{6}$/, { error: "OTP must contain only numbers" }),
});

/* =====================================================
   PASSWORD RESET SCHEMAS
===================================================== */

/**
 * Forgot Password
 */
export const forgotPasswordSchema = z.object({
  email: z
    .string({ error: "Email is required" })
    .trim()
    .toLowerCase()
    .email({ error: "Invalid email address" }),
});

/**
 * Verify Password Reset OTP
 */
export const verifyPasswordResetOTPSchema = z.object({
  email: z
    .string({ error: "Email is required" })
    .trim()
    .toLowerCase()
    .email({ error: "Invalid email address" }),

  otpCode: z
    .string({ error: "OTP is required" })
    .length(6, { error: "OTP must be exactly 6 digits" })
    .regex(/^\d{6}$/, { error: "OTP must contain only numbers" }),
});

/**
 * Reset Password
 */
export const resetPasswordSchema = z.object({
  resetToken: z
    .string({ error: "Reset token is required" })
    .min(1, { error: "Reset token is required" }),

  newPassword: z
    .string({ error: "New password is required" })
    .min(6, { error: "Password must be at least 6 characters" })
    .max(128, { error: "Password must be less than 128 characters" }),
});
