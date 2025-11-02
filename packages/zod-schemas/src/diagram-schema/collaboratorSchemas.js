import { z } from "zod";

export const addCollaboratorSchema = z.object({
  email: z.string().email("Email must be a valid email address"),
});

export const removeCollaboratorSchema = z.object({
  email: z.string().email("Email must be a valid email address"),
});

export const acceptInvitationSchema = z.object({
  token: z.string().min(1, "Token is required"),
});
