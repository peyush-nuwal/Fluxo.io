import logger from "../../../diagram-service/src/config/logger.js";
import { generateDiagramJSON } from "../services/ai.service.js";
import { sendError, sendSuccess } from "../utils/response.js";

import {
  aiPromptSchema,
  ZodError,
} from "../../../../../packages/zod-schemas/index.js";

export const generateDiagram = async (req, res) => {
  try {
    const userId = req.user?.id || "sadfsa";
    if (!userId) return sendError(res, 401, "Unauthorized");

    const { prompt } = aiPromptSchema.parse(req.body);
    console.log(prompt);

    const data = await generateDiagramJSON(prompt);
    return sendSuccess(res, 200, "Diagram generated successfully", { data });
  } catch (error) {
    logger.error("Error generate Diagram", error);
    return sendError(res, 500, "Internal server error");
  }
};
