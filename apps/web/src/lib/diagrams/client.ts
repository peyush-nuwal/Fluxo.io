"use client";

import {
  frontendApiDelete,
  frontendApiGet,
  frontendApiPatch,
  frontendApiPost,
  frontendApiPut,
} from "@/lib/frontend-api";
import {
  DiagramPayload,
  SetDiagramActivePayload,
  UpdateDiagramPayload,
} from "@/types";

export async function getDiagramsByUser() {
  return frontendApiGet("/api/v1/diagrams");
}

export async function getDiagramById(diagramId: string) {
  return frontendApiGet(`/api/v1/diagrams/${diagramId}`);
}

export async function createDiagram(payload: DiagramPayload | FormData) {
  return frontendApiPost("/api/v1/diagrams", payload);
}

export async function updateDiagram(
  payload: UpdateDiagramPayload | FormData,
  diagramId: string,
) {
  return frontendApiPut(`/api/v1/diagrams/${diagramId}`, payload);
}

export async function updateDiagramData(
  diagramId: string,
  data: Record<string, unknown> | null,
) {
  return updateDiagram({ data }, diagramId);
}

export async function setDiagramActiveState(
  diagramId: string,
  payload: SetDiagramActivePayload,
) {
  return frontendApiPatch(`/api/v1/diagrams/${diagramId}/active`, payload);
}

export async function softDeleteDiagram(diagramId: string) {
  return frontendApiDelete(`/api/v1/diagrams/${diagramId}`);
}

export const getSoftDeletedDiagrams = async () => {
  return frontendApiGet("/api/v1/diagrams/trash");
};

export async function hardDeleteDiagram(diagramId: string) {
  return frontendApiDelete(`/api/v1/diagrams/trash/${diagramId}`);
}

export async function VerifyOwnerOfDiagram(diagramId: string) {
  return frontendApiGet(`/api/v1/diagrams/${diagramId}/ownership`);
}
