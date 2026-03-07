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

export async function createProject(payload: createProjectPayload) {
  return apiFetch("/api/v1/projects", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getProjectById(projectId: string) {
  return apiFetch(`/api/v1/projects/${projectId}`);
}

export async function getProjectDiagrams(projectId: string) {
  return apiFetch(`/api/v1/projects/${projectId}/diagrams`);
}
