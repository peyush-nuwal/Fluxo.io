import { z } from "zod";

// Signup schema
export const signupSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
});

// Login schema
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});
