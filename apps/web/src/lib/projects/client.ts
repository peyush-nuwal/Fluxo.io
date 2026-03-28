import {
  frontendApiDelete,
  frontendApiGet,
  frontendApiPost,
  frontendApiPut,
} from "../frontend-api";
import { ProjectPayload, UpdateProjectPayload } from "@/types/project";

export async function getProjects() {
  return frontendApiGet("/api/v1/projects");
}

export async function createProject(payload: ProjectPayload | FormData) {
  return frontendApiPost("/api/v1/projects", payload);
}

export async function updateProject(
  projectId: string,
  payload: UpdateProjectPayload | FormData,
) {
  return frontendApiPut(`/api/v1/projects/${projectId}`, payload);
}

export async function deleteProject(projectId: string) {
  return frontendApiDelete(`/api/v1/projects/${projectId}`);
}

export async function getProjectById(projectId: string) {
  return frontendApiGet(`/api/v1/projects/${projectId}`);
}

export async function getProjectDiagrams(projectId: string) {
  return frontendApiGet(`/api/v1/projects/${projectId}/diagrams`);
}
