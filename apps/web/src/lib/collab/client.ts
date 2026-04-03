import {
  frontendApiDelete,
  frontendApiGet,
  frontendApiPost,
} from "../frontend-api";

const collaboratorsPath = (projectId: string) =>
  `/api/v1/projects/${encodeURIComponent(projectId)}/collaborators`;

export const getCollaborators = async (projectId: string) =>
  frontendApiGet(collaboratorsPath(projectId));

export const addCollaborator = async (projectId: string, email: string) =>
  frontendApiPost(collaboratorsPath(projectId), { email });

export const deleteCollaborator = async (projectId: string, email: string) =>
  frontendApiDelete(
    `${collaboratorsPath(projectId)}?email=${encodeURIComponent(email)}`,
  );

// Backward-compatible alias for existing imports.
export const addCollaborators = addCollaborator;
