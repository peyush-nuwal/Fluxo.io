import logger from "../config/logger.js";
import { openai } from "../config/openai.js";

export const generateDiagramJSON = async (prompt) => {
  try {
    if (!prompt) throw new Error("Missing prompt");

    const response = await openai.responses.create({
      model: "gpt-4o-2024-08-06", // latest model that supports structured outputs
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text", // ✅ FIXED
              text: "You are a diagram generator. Return only valid JSON with 'nodes' and 'edges' describing a system. Example: { nodes: [{id, label, type}], edges: [{from, to}] }",
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "input_text", // ✅ FIXED
              text: prompt,
            },
          ],
        },
      ],
      text: {
        format: {
          name: "diagram_json",
          type: "json_schema",
          strict: true, // ✅ stays at this level now
          schema: {
            type: "object",
            properties: {
              nodes: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    label: { type: "string" },
                    type: { type: "string" },
                  },
                  required: ["id", "label", "type"],
                  additionalProperties: false,
                },
              },
              edges: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    from: { type: "string" },
                    to: { type: "string" },
                  },
                  required: ["from", "to"],
                  additionalProperties: false,
                },
              },
            },
            required: ["nodes", "edges"],
            additionalProperties: false,
          },
        },
      },
    });

    const text = response.output[0].content[0].text;
    const parsed = JSON.parse(text);

    logger.info("✅ Diagram generated successfully");
    return parsed;
  } catch (error) {
    logger.error("❌ Error while generating response with AI", {
      message: error.message,
      details: error.response?.data || error.response || error,
    });
    return null;
  }
};
