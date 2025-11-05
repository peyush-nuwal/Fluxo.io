import { z } from "zod";

export const aiPromptSchema = z.object({
  prompt: z.string().min(6, "prompt must be at least 6 character"),
});
