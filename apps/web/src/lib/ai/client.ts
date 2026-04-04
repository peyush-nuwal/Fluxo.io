"use client";

import { createDiagram } from "@/lib/diagrams/client";
import { frontendApiPost } from "@/lib/frontend-api";
import type { DiagramPayload } from "@/types";

export type GeneratedDiagramData = {
  nodes: unknown[];
  edges: unknown[];
};

type GenerateDiagramApiResponse = {
  success: boolean;
  message: string;
  data: GeneratedDiagramData;
};

type CreateDiagramFromPromptInput = {
  prompt: string;
  payload: Omit<DiagramPayload, "data">;
};

export async function generateDiagramFromPrompt(
  prompt: string,
): Promise<GenerateDiagramApiResponse> {
  return frontendApiPost<GenerateDiagramApiResponse>(
    "/api/v1/ai/generate-diagram",
    {
      prompt,
    },
  );
}

export async function createDiagramFromPrompt({
  prompt,
  payload,
}: CreateDiagramFromPromptInput) {
  const cleanPrompt = prompt.trim();
  if (cleanPrompt.length < 6) {
    throw new Error("Prompt must be at least 6 characters");
  }

  const generated = await generateDiagramFromPrompt(cleanPrompt);
  const generatedData = generated?.data;

  if (
    !generatedData ||
    !Array.isArray(generatedData.nodes) ||
    !Array.isArray(generatedData.edges)
  ) {
    throw new Error("AI did not return valid diagram data");
  }

  const finalPayload: DiagramPayload = {
    ...payload,
    data: generatedData,
    name:
      payload.name && payload.name.trim().length > 0
        ? payload.name
        : cleanPrompt.slice(0, 60),
  };

  return createDiagram(finalPayload);
}
