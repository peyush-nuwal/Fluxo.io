"use client";

import { create } from "zustand";
import type {
  DiagramPayload,
  DiagramResource,
  UpdateDiagramPayload,
} from "@/types/diagrams";
import {
  getDiagramsByUser,
  getDiagramById,
  createDiagram,
  getSoftDeletedDiagrams,
  setDiagramActiveState as setDiagramActiveStateRequest,
  updateDiagramData as updateDiagramDataRequest,
  updateDiagram,
  VerifyOwnerOfDiagram,
} from "@/lib/diagrams/client";
import { getProjectDiagrams } from "@/lib/projects/client";

type DiagramState = {
  diagrams: DiagramResource[];
  selectedDiagram: DiagramResource | null;
  loading: boolean;
  error: string | null;
};
type diagramResult = {
  success: boolean;
  diagram?: DiagramResource;
  message?: string;
};
type DiagramActions = {
  setDiagrams: (diagrams: DiagramResource[]) => void;
  setSelectedDiagram: (diagram: DiagramResource | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchDiagrams: () => Promise<void>;
  fetchProjectDiagrams: (projectId: string) => Promise<void>;
  fetchTrashDiagrams: () => Promise<void>;
  fetchDiagramById: (diagramId: string) => Promise<void>;
  createDiagram: (payload: DiagramPayload | FormData) => Promise<diagramResult>;
  updateDiagram: (
    payload: UpdateDiagramPayload | FormData,
    diagramId: string,
  ) => Promise<diagramResult>;
  updateDiagramData: (
    diagramId: string,
    data: Record<string, unknown> | null,
  ) => Promise<diagramResult>;
  setDiagramActiveState: (
    diagramId: string,
    isActive: boolean,
  ) => Promise<diagramResult>;
  reset: () => void;
  verifyDiagramOwnership: (diagramId: string) => Promise<boolean>;
};

const initialState: DiagramState = {
  diagrams: [],
  selectedDiagram: null,
  loading: false,
  error: null,
};

export const useDiagramStore = create<DiagramState & DiagramActions>(
  (set, get) => ({
    ...initialState,

    setDiagrams: (diagrams) => set({ diagrams }),
    setSelectedDiagram: (selectedDiagram) => set({ selectedDiagram }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),

    fetchDiagrams: async () => {
      set({ loading: true, error: null });
      try {
        const data = await getDiagramsByUser();
        set({ diagrams: data?.data?.diagrams ?? [], loading: false });
      } catch (err: any) {
        set({
          error: err?.message ?? "Failed to fetch diagrams",
          loading: false,
        });
      }
    },
    fetchProjectDiagrams: async (projectId) => {
      set({ loading: true, error: null });
      try {
        const data = await getProjectDiagrams(projectId);
        set({ diagrams: data?.data?.diagrams ?? [], loading: false });
      } catch (err: any) {
        set({
          error: err?.message ?? "Failed to fetch project diagrams",
          loading: false,
        });
      }
    },

    fetchTrashDiagrams: async () => {
      set({ loading: true, error: null });
      try {
        const data = await getSoftDeletedDiagrams();
        set({ diagrams: data?.data?.diagrams ?? [], loading: false });
      } catch (err: any) {
        set({
          error: err?.message ?? "Failed to fetch deleted diagrams",
          loading: false,
        });
      }
    },

    fetchDiagramById: async (diagramId) => {
      set({ loading: true, error: null });
      try {
        const data = await getDiagramById(diagramId);
        const diagram = data?.data?.diagram ?? null;
        set({ selectedDiagram: diagram, loading: false });
      } catch (err: any) {
        set({
          error: err?.message ?? "Failed to fetch diagram",
          loading: false,
        });
      }
    },

    createDiagram: async (payload) => {
      try {
        const data = await createDiagram(payload);
        const diagram = data?.data?.diagram ?? null;
        const message = data?.message ?? "Diagram created successfully";

        if (!diagram) {
          return { success: false, message: "Failed to create diagram" };
        }

        set({ diagrams: [diagram, ...get().diagrams] });

        return { success: true, diagram, message };
      } catch (err: any) {
        return {
          success: false,
          message: err?.message ?? "Failed to create diagram",
        };
      }
    },
    updateDiagram: async (payload, diagramId) => {
      try {
        const data = await updateDiagram(payload, diagramId);
        const diagram = data?.data?.diagram ?? null;
        const message = data?.message ?? "Diagram updated successfully";

        if (!diagram) {
          return { success: false, message: "Failed to update diagram" };
        }

        const diagrams = get().diagrams;
        const updatedDiagrams = diagrams.some((d) => d.id === diagram.id)
          ? diagrams.map((d) => (d.id === diagram.id ? diagram : d))
          : [diagram, ...diagrams];
        set({
          diagrams: updatedDiagrams,
          selectedDiagram:
            get().selectedDiagram?.id === diagram.id
              ? diagram
              : get().selectedDiagram,
        });

        return { success: true, diagram, message };
      } catch (err: any) {
        return {
          success: false,
          message: err?.message ?? "Failed to update diagram",
        };
      }
    },
    updateDiagramData: async (diagramId, dataPayload) => {
      try {
        const data = await updateDiagramDataRequest(diagramId, dataPayload);
        const diagram = data?.data?.diagram ?? null;
        const message = data?.message ?? "Diagram updated successfully";

        if (!diagram) {
          return { success: false, message: "Failed to update diagram data" };
        }

        const diagrams = get().diagrams;
        const updatedDiagrams = diagrams.some((d) => d.id === diagram.id)
          ? diagrams.map((d) => (d.id === diagram.id ? diagram : d))
          : [diagram, ...diagrams];
        set({
          diagrams: updatedDiagrams,
          selectedDiagram:
            get().selectedDiagram?.id === diagram.id
              ? diagram
              : get().selectedDiagram,
        });

        return { success: true, diagram, message };
      } catch (err: any) {
        return {
          success: false,
          message: err?.message ?? "Failed to update diagram data",
        };
      }
    },
    setDiagramActiveState: async (diagramId, isActive) => {
      try {
        const data = await setDiagramActiveStateRequest(diagramId, {
          is_active: isActive,
        });
        const diagram = data?.data?.diagram ?? null;
        const message =
          data?.message ?? "Diagram active state updated successfully";

        if (!diagram) {
          return { success: false, message: "Failed to update active status" };
        }

        const diagrams = get().diagrams;
        const updatedDiagrams = diagrams.some((d) => d.id === diagram.id)
          ? diagrams.map((d) =>
              d.id === diagram.id ? { ...d, is_active: diagram.is_active } : d,
            )
          : diagrams;
        const currentSelectedDiagram = get().selectedDiagram;

        set({
          diagrams: updatedDiagrams,
          selectedDiagram:
            currentSelectedDiagram?.id === diagram.id
              ? diagram
              : currentSelectedDiagram,
        });

        return { success: true, diagram, message };
      } catch (err: any) {
        return {
          success: false,
          message: err?.message ?? "Failed to update active status",
        };
      }
    },

    reset: () => set({ ...initialState }),
    verifyDiagramOwnership: async (diagramId) => {
      try {
        const data = await VerifyOwnerOfDiagram(diagramId);

        if (!data) return false;
        return Boolean(data?.data?.isOwner);
      } catch (err: any) {
        set({
          error: err?.message ?? "Failed to verify diagram ownership",
        });
        return false;
      }
    },
  }),
);
