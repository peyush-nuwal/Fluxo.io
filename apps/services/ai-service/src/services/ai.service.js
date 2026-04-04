import logger from "../config/logger.js";
import { genai } from "../config/gemini.js";

export const generateDiagramJSON = async (prompt) => {
  try {
    if (!prompt) throw new Error("Missing prompt");

    const fullPrompt = `
You are generating data for a React Flow canvas.

Return ONLY valid JSON (no markdown, no explanation) with this exact top-level shape:
{
  "nodes": [
    {
      "id": "string",
      "type": "shape-node",
      "position": { "x": 0, "y": 0 },
      "data": {
        "label": "string",
        "shape": "text | rectangle | diamond | circle",
        "style": {
          "borderStyle": "solid | dashed | dotted",
          "borderWidth": 2,
          "borderRadius": 16,
          "borderColor": "hsl(var(--border))",
          "backgroundColor": "hsl(var(--background))",
          "fontSize": 14
        }
      },
      "style": { "width": 200, "height": 100 }
    }
  ],
  "edges": [
    {
      "id": "string",
      "source": "node-id",
      "target": "node-id",
      "type": "button-edge",
      "animated": false,
      "data": {
        "variant": "bezier | straight | smoothstep",
        "endType": "arrowclosed | arrow | none",
        "label": "string"
      }
    }
  ]
}

Rules:
- IDs must be unique.
- Every edge source/target must exist in nodes.
- Do not create self-loops unless explicitly requested.
- Keep layout readable: place nodes left-to-right in layers, with spacing (x gap ~260, y gap ~160).
- Use "rectangle" for services/components, "diamond" for decisions, "circle" for start/end, "text" for notes.
- Keep node labels short (2-5 words).
- Return only JSON.

Generate a system design diagram for:
 ${prompt}
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
