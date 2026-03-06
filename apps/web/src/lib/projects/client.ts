import { apiFetch } from "../api";

export async function getProjects() {
  return apiFetch("/api/v1/projects");
}

export async function getProjectById(projectId: string) {
  return apiFetch(`/api/v1/projects/${projectId}`);
}

export async function getProjectDiagrams(projectId: string) {
  return apiFetch(`/api/v1/projects/${projectId}/diagrams`);
}
