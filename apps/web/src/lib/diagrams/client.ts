"use client";

import { apiFetch } from "@/lib/api";

// TODO: replace these endpoints with your API gateway routes for diagram-service.
// Example base: "/api/v1"

type createDiagramPayload = {
  name?: string | null;
  projectId?: string | null;
  data?: Record<string, any> | null;
  description?: string | null;
  thumbnail_url?: string | null;
  owner_name?: string | null;
  owner_username?: string | null;
  owner_avatar_url?: string | null;
};

export async function getDiagramsByUser() {
  return apiFetch("/api/v1/diagrams");
}

export async function getDiagramById(diagramId: string) {
  return apiFetch(`/api/v1/diagrams/${diagramId}`);
}

export async function createDiagram(payload: createDiagramPayload | FormData) {
  const options: Record<string, unknown> = { method: "POST" };

  if (payload instanceof FormData) {
    options.data = payload;
  } else {
    options.body = JSON.stringify(payload);
  }

  const response = await apiFetch("/api/v1/diagrams", options);
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
