import { z } from "zod";

// Signup schema
export const signUpSchema = z.object({
  name: z.string().min(2).max(255).trim(),
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(6).max(128),
});

export const signInSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(6).max(128),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(6).max(128),
  newPassword: z.string().min(6).max(128),
});

// OTP schemas
export const generateOTPSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  purpose: z.enum(["email_verification", "password_reset", "login", "two_factor"]).default("email_verification"),
});

export const verifyOTPSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  otpCode: z.string().length(6, "OTP must be exactly 6 digits").regex(/^\d{6}$/, "OTP must contain only numbers"),
  purpose: z.enum(["email_verification", "password_reset", "login", "two_factor"]).default("email_verification"),
});

export const resendOTPSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  purpose: z.enum(["email_verification", "password_reset", "login", "two_factor"]).default("email_verification"),
});

export const getOTPStatusSchema = z.object({
  purpose: z.enum(["email_verification", "password_reset", "login", "two_factor"]).default("email_verification"),
});
