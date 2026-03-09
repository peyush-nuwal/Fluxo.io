import { apiFetch } from "../api";

type createProjectPayload = {
  title?: string | null;
  description?: string | null;
  thumbnail_url?: string | null;
  owner_name?: string | null;
  owner_username?: string | null;
  owner_avatar_url?: string | null;
};

export async function getProjects() {
  return apiFetch("/api/v1/projects");
}

export async function createProject(payload: createProjectPayload | FormData) {
  const options: Record<string, unknown> = { method: "POST" };

  if (payload instanceof FormData) {
    options.data = payload;
  } else {
    options.body = JSON.stringify(payload);
  }

  const response = await apiFetch("/api/v1/projects", options);
  return response?.project ?? response;
}

export async function getProjectById(projectId: string) {
  return apiFetch(`/api/v1/projects/${projectId}`);
}

export async function getProjectDiagrams(projectId: string) {
  return apiFetch(`/api/v1/projects/${projectId}/diagrams`);
}
