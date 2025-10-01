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
