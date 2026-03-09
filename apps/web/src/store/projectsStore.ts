"use client";
import {
  createProject,
  getProjectById,
  getProjects,
} from "@/lib/projects/client";
import { ProjectType } from "@/types/project";
import { create } from "zustand";

type ProjectState = {
  projects: ProjectType[];
  selectedProject: ProjectType | null;
  loading: boolean;
  error: string | null;
};

type ProjectActions = {
  setProjects: (projects: ProjectType[]) => void;
  setSelectedProject: (project: ProjectType | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchProject: () => Promise<void>;
  fetchProjectById: (projectId: string) => Promise<void>;
  createProject: (
    payload:
      | {
          title?: string | null;
          description?: string | null;
          thumbnail_url?: string | null;
          owner_name?: string | null;
          owner_username?: string | null;
          owner_avatar_url?: string | null;
        }
      | FormData,
  ) => Promise<ProjectType | null>;
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
        set({ projects: data?.projects ?? data ?? [], loading: false });
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
        const project = data?.project ?? data ?? null;
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
        const project = await createProject(payload);
        if (project) {
          set({ projects: [project, ...get().projects], loading: false });
        } else {
          set({ loading: false });
        }
        return project;
      } catch (err: any) {
        set({
          error: err?.message ?? "Failed to create project",
          loading: false,
        });
        return null;
      }
    },
    reset: () => set(initialState),
  }),
);
