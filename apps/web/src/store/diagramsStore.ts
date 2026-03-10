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
  updateDiagram,
} from "@/lib/diagrams/client";

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
  fetchTrashDiagrams: () => Promise<void>;
  fetchDiagramById: (diagramId: string) => Promise<void>;
  createDiagram: (payload: DiagramPayload | FormData) => Promise<diagramResult>;
  updateDiagram: (
    payload: UpdateDiagramPayload | FormData,
    diagramId: string,
  ) => Promise<diagramResult>;
  reset: () => void;
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
        set({ diagrams: data?.diagrams ?? data ?? [], loading: false });
      } catch (err: any) {
        set({
          error: err?.message ?? "Failed to fetch diagrams",
          loading: false,
        });
      }
    },

    fetchTrashDiagrams: async () => {
      set({ loading: true, error: null });
      try {
        const data = await getSoftDeletedDiagrams();
        set({ diagrams: data?.diagrams ?? data ?? [], loading: false });
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
        const diagram = data?.diagram ?? data ?? null;
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
        const diagram = data?.diagram ?? data ?? null;

        if (!diagram) {
          return { success: false, message: "Failed to create diagram" };
        }

        set({ diagrams: [diagram, ...get().diagrams] });

        return { success: true, diagram };
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
        const diagram = data?.diagram ?? data ?? null;

        if (!diagram) {
          return { success: false, message: "Failed to update diagram" };
        }

        const diagrams = get().diagrams;
        const updatedDiagrams = diagrams.some((d) => d.id === diagram.id)
          ? diagrams.map((d) => (d.id === diagram.id ? diagram : d))
          : [diagram, ...diagrams];
        set({ diagrams: updatedDiagrams });

        return { success: true, diagram };
      } catch (err: any) {
        return {
          success: false,
          message: err?.message ?? "Failed to update diagram",
        };
      }
    },

    reset: () => set({ ...initialState }),
  }),
);
