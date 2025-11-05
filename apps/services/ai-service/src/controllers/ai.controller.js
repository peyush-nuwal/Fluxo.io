import logger from "../../../diagram-service/src/config/logger.js";
import { generateDiagramJSON } from "../services/ai.service.js";

import {
  aiPromptSchema,
  ZodError,
} from "../../../../../packages/zod-schemas/index.js";

export const generateDiagram = async (req, res) => {
  try {
    const userId = req.user?.id || "sadfsa";
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { prompt } = aiPromptSchema.parse(req.body);
    console.log(prompt);

    const data = await generateDiagramJSON(prompt);
    res.status(200).json({ success: true, data });
  } catch (error) {
    logger.error("Error generate Diagram", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
