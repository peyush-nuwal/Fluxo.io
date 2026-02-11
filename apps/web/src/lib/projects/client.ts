import { apiFetch } from "../api";

export async function getProjects() {
  return apiFetch("/api/v1/diagram/projects");
}

export async function getProjectById(projectId: string) {
  return apiFetch(`/api/v1/diagram/projects/${projectId}`);
}

export async function getProjectDiagrams(projectId: string) {
  return apiFetch(`/api/v1/diagram/projects/${projectId}/diagrams`);
}
