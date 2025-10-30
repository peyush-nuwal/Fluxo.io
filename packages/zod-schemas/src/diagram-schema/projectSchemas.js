import { z } from "zod";

export const createProjectSchema = z.object({
  title: z.string().min(1, "title is required"),
  description: z.string().optional(),
  thumbnail_url: z.string().url().optional(),
});

export const updateProjectSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  thumbnail_url: z.string().url().optional(),
  is_public: z.boolean().optional(),
  collaborators: z.array(z.string()).optional(),
});
