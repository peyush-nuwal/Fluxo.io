import { apiFetch } from "../api";

export const getCollaborators = async (projectId: string) => {
  return apiFetch(`/api/v1/diagram/projects/${projectId}/collaborators`);
};

export const addCollaborators = async (projectId: string, email: string) => {
  return apiFetch(`/api/v1/diagram/projects/${projectId}/collaborators`, {
    method: "POST",
    body: JSON.stringify({ email }),
    headers: {
      "Content-Type": "application/json",
    },
  });
};
