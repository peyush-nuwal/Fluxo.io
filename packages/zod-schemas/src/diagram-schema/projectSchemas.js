import { z } from "zod";

export const createProjectSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().nullable(),
  thumbnail_url: z
    .union([z.string().url(), z.literal("")])
    .optional()
    .nullable(),
  owner_name: z.string().optional().nullable(),
  owner_username: z.string().optional().nullable(),
  owner_avatar_url: z
    .union([z.string().url(), z.literal("")])
    .optional()
    .nullable(),
});

export const updateProjectSchema = z.object({
  title: z.string().min(1, "Title must be at least 1 character").optional(),
  description: z.string().optional().nullable(),
  thumbnail_url: z
    .union([z.string().url(), z.literal("")])
    .optional()
    .nullable(),
  is_public: z.boolean().optional(),
  collaborators: z.array(z.string()).optional(),
  owner_name: z.string().optional().nullable(),
  owner_username: z.string().optional().nullable(),
  owner_avatar_url: z
    .union([z.string().url(), z.literal("")])
    .optional()
    .nullable(),
});
