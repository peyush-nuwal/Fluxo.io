"use client";

import { apiFetch } from "@/lib/api";
import { DiagramPayload, UpdateDiagramPayload } from "@/types";

// TODO: replace these endpoints with your API gateway routes for diagram-service.
// Example base: "/api/v1"

export async function getDiagramsByUser() {
  return apiFetch("/api/v1/diagrams");
}

export async function getDiagramById(diagramId: string) {
  return apiFetch(`/api/v1/diagrams/${diagramId}`);
}

export async function createDiagram(payload: DiagramPayload | FormData) {
  const options: Record<string, unknown> = { method: "POST" };

  if (payload instanceof FormData) {
    options.data = payload;
  } else {
    options.body = JSON.stringify(payload);
  }

  const response = await apiFetch("/api/v1/diagrams", options);
  return response?.diagram ?? response;
}

export async function updateDiagram(
  payload: UpdateDiagramPayload | FormData,
  diagramId: string,
) {
  const options: RequestInit = {
    method: "PUT",
  };

  if (payload instanceof FormData) {
    options.body = payload;
  } else {
    options.body = JSON.stringify(payload);
    options.headers = {
      "Content-Type": "application/json",
    };
  }

  const response = await apiFetch(`/api/v1/diagrams/${diagramId}`, options);

  return response?.diagram ?? response;
}

export async function softDeleteDiagram(diagramId: string) {
  return apiFetch(`/api/v1/diagrams/${diagramId}`, {
    method: "DELETE",
  });
}

export const getSoftDeletedDiagrams = async () => {
  return apiFetch("/api/v1/diagrams/trash");
};

export async function hardDeleteDiagram(diagramId: string) {
  return apiFetch(`/api/v1/diagrams/trash/${diagramId}`, {
    method: "DELETE",
  });
}
