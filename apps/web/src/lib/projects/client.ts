import { apiFetch } from "../api";
import { ProjectPayload, UpdateProjectPayload } from "@/types/project";

export async function getProjects() {
  return apiFetch("/api/v1/diagram/projects");
}

export async function createProject(payload: ProjectPayload | FormData) {
  const options: Record<string, unknown> = { method: "POST" };

  if (payload instanceof FormData) {
    options.data = payload;
  } else {
    options.body = JSON.stringify(payload);
  }

  return apiFetch("/api/v1/diagram/projects", options);
}

export async function updateProject(
  projectId: string,
  payload: UpdateProjectPayload | FormData,
) {
  const options: Record<string, unknown> = { method: "PUT" };

  if (payload instanceof FormData) {
    options.data = payload;
  } else {
    options.body = JSON.stringify(payload);
  }

  return apiFetch(`/api/v1/diagram/projects/${projectId}`, options);
}

export async function deleteProject(projectId: string) {
  return apiFetch(`/api/v1/diagram/projects/${projectId}`, {
    method: "DELETE",
  });
}

export async function getProjectById(projectId: string) {
  return apiFetch(`/api/v1/diagram/projects/${projectId}`);
}

export async function getProjectDiagrams(projectId: string) {
  return apiFetch(`/api/v1/diagram/projects/${projectId}/diagrams`);
}
