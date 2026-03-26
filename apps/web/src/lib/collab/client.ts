import { apiFetch } from "../api";

export const getCollaborators = async (projectId: string) => {
  return apiFetch(`/api/v1/diagram/projects/${projectId}/collaborators`);
};
