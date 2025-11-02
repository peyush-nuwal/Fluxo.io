import { z } from "zod";

export const createDiagramSchema = z.object({
  name: z.string().min(1, "Name is required"),
  data: z.any().optional().nullable(), // React Flow data - optional, will be initialized as empty if not provided
});

export const updateDiagramSchema = z.object({
  name: z.string().min(1, "Name must be at least 1 character").optional(),
  data: z.any().optional().nullable(),
  is_active: z.boolean().optional(),
});
