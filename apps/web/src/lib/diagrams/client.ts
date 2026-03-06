"use client";

import { apiFetch } from "@/lib/api";

// TODO: replace these endpoints with your API gateway routes for diagram-service.
// Example base: "/api/v1"

export async function getDiagramsByUser() {
  return apiFetch("/api/v1/diagrams");
}

export async function getDiagramById(diagramId: string) {
  return apiFetch(`/api/v1/diagrams/${diagramId}`);
}

export async function createDiagram(payload: {
  name?: string | null;
  projectId?: string | null;
  data?: Record<string, any> | null;
  description?: string | null;
  thumbnail_url?: string | null;
  owner_name?: string | null;
  owner_username?: string | null;
  owner_avatar_url?: string | null;
}) {
  return apiFetch("/api/v1/diagrams", {
    method: "POST",
    body: JSON.stringify(payload),
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
