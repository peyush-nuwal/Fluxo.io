import { z } from "zod";

export const createDiagramSchema = z.object({
  name: z.string().min(1, "Name is required"),
  data: z.any().optional().nullable(), // React Flow data
  projectId: z.string().uuid().optional().nullable(),
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

export const updateDiagramSchema = z.object({
  name: z.string().min(1, "Name must be at least 1 character").optional(),
  description: z.string().optional().nullable(),
  data: z.any().optional().nullable(),
  is_active: z.boolean().optional(),
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
