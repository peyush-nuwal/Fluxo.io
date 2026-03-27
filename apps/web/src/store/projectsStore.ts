"use client";
import {
  createProject as createProjectRequest,
  deleteProject as deleteProjectRequest,
  getProjectById,
  getProjects,
  updateProject as updateProjectRequest,
} from "@/lib/projects/client";
import {
  ProjectPayload,
  ProjectType,
  UpdateProjectPayload,
} from "@/types/project";
import { create } from "zustand";

type ProjectState = {
  projects: ProjectType[];
  selectedProject: ProjectType | null;
  loading: boolean;
  error: string | null;
};

type ProjectResult = {
  success: boolean;
  project?: ProjectType;
  projectId?: string;
  message?: string;
};
type ProjectActions = {
  setProjects: (projects: ProjectType[]) => void;
  setSelectedProject: (project: ProjectType | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchProject: () => Promise<void>;
  fetchProjectById: (projectId: string) => Promise<void>;
  createProject: (payload: ProjectPayload | FormData) => Promise<ProjectResult>;
  updateProject: (
    projectId: string,
    payload: UpdateProjectPayload | FormData,
  ) => Promise<ProjectResult>;
  deleteProject: (projectId: string) => Promise<ProjectResult>;
  reset: () => void;
};

const initialState: ProjectState = {
  projects: [],
  selectedProject: null,
  loading: false,
  error: null,
};

export const useProjectStore = create<ProjectState & ProjectActions>(
  (set, get) => ({
    ...initialState,

    setProjects: (projects) => set({ projects }),

    setSelectedProject: (selectedProject) => set({ selectedProject }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    fetchProject: async () => {
      set({ loading: true, error: null });
      try {
        const data = await getProjects();
        set({ projects: data?.data?.projects ?? [], loading: false });
      } catch (err: any) {
        set({
          error: err?.message ?? "Failed to fetch projects",
          loading: false,
        });
      }
    },
    fetchProjectById: async (projectId) => {
      set({ loading: true, error: null });
      try {
        const data = await getProjectById(projectId);
        const project = data?.data?.project ?? null;
        set({ selectedProject: project, loading: false });
      } catch (err: any) {
        set({
          error: err?.message ?? "Failed to fetch project",
          loading: false,
        });
      }
    },
    createProject: async (payload) => {
      set({ loading: true, error: null });
      try {
        const data = await createProjectRequest(payload);
        const project = data?.data?.project ?? null;
        const message = data?.message ?? "Project created successfully";

        if (!project) {
          set({ loading: false });
          return { success: false, message: "Failed to create project" };
        }

        set({ projects: [project, ...get().projects], loading: false });
        return { success: true, project, message };
      } catch (err: any) {
        set({
          error: err?.message ?? "Failed to create project",
          loading: false,
        });
        return {
          success: false,
          message: err?.message ?? "Failed to create project",
        };
      }
    },
    updateProject: async (projectId, payload) => {
      set({ loading: true, error: null });
      try {
        const data = await updateProjectRequest(projectId, payload);
        const project = data?.data?.project ?? null;
        const message = data?.message ?? "Project updated successfully";

        if (!project) {
          set({ loading: false });
          return { success: false, message: "Failed to update project" };
        }

        const projects = get().projects;
        const updatedProjects = projects.some((p) => p.id === project.id)
          ? projects.map((p) => (p.id === project.id ? project : p))
          : [project, ...projects];

        set({
          projects: updatedProjects,
          selectedProject:
            get().selectedProject?.id === project.id
              ? project
              : get().selectedProject,
          loading: false,
        });

        return { success: true, project, message };
      } catch (err: any) {
        set({
          error: err?.message ?? "Failed to update project",
          loading: false,
        });
        return {
          success: false,
          message: err?.message ?? "Failed to update project",
        };
      }
    },
    deleteProject: async (projectId) => {
      set({ loading: true, error: null });
      try {
        const data = await deleteProjectRequest(projectId);
        const message = data?.message ?? "Project deleted successfully";

        set({
          projects: get().projects.filter(
            (project) => project.id !== projectId,
          ),
          selectedProject:
            get().selectedProject?.id === projectId
              ? null
              : get().selectedProject,
          loading: false,
        });

        return { success: true, projectId, message };
      } catch (err: any) {
        set({
          error: err?.message ?? "Failed to delete project",
          loading: false,
        });
        return {
          success: false,
          message: err?.message ?? "Failed to delete project",
        };
      }
    },
    reset: () => set(initialState),
  }),
);
