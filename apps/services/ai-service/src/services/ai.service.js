import logger from "../config/logger.js";
import { genai } from "../config/gemini.js";

export const generateDiagramJSON = async (prompt) => {
  try {
    if (!prompt) throw new Error("Missing prompt");

    const fullPrompt = `
You are a diagram generator. Respond ONLY with valid JSON following this structure:
{
  "nodes": [{ "id": string, "label": string, "type": string }],
  "edges": [{ "from": string, "to": string }]
}
Do not include explanations, markdown, or extra text.
Now, create a system design for: ${prompt}
`;

    const response = await genai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: fullPrompt }],
        },
      ],
    });

    // ✅ Correct way to extract Gemini output
    const text =
      response?.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
      response?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) throw new Error("Empty response from Gemini API");

    // 🧼 Clean possible markdown
    const cleanText = text.replace(/```json|```/g, "").trim();

    // ✅ Parse JSON safely
    const parsed = JSON.parse(cleanText);

    if (!parsed.nodes || !parsed.edges) {
      throw new Error("Invalid diagram format: missing nodes or edges");
    }

    logger.info("✅ Diagram generated successfully");
    return parsed;
  } catch (error) {
    logger.error("❌ Error while generating diagram JSON", {
      message: error.message,
      details: error.response?.data || error.response || error,
    });
    return null;
  }
};
