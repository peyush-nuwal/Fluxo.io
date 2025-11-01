import { z } from "zod";

export const createDiagramSchema = z.object({
  name: z.string().min(1, "Name is required"),
  data: z.any().optional(), // React Flow data - optional, will be initialized as empty if not provided
});

export const updateDiagramSchema = z.object({
  name: z.string().min(1).optional(),
  data: z.any().optional(),
  is_active: z.boolean().optional(),
});
