"use client";

import { apiFetch } from "@/lib/api";
import {
  DiagramPayload,
  SetDiagramActivePayload,
  UpdateDiagramPayload,
} from "@/types";

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

  return apiFetch("/api/v1/diagrams", options);
}

export async function updateDiagram(
  payload: UpdateDiagramPayload | FormData,
  diagramId: string,
) {
  const options: Record<string, unknown> = {
    method: "PUT",
  };

  if (payload instanceof FormData) {
    options.data = payload;
  } else {
    options.body = JSON.stringify(payload);
    options.headers = {
      "Content-Type": "application/json",
    };
  }

  return apiFetch(`/api/v1/diagrams/${diagramId}`, options);
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
  return apiFetch(`/api/v1/diagrams/${diagramId}/active`, {
    method: "PATCH",
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
    },
  });
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

export async function VerifyOwnerOfDiagram(diagramId: string) {
  return apiFetch(`/api/v1/diagrams/${diagramId}/ownership`, {
    method: "GET",
  });
}
