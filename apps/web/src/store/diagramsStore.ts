"use client";

import { create } from "zustand";
import type { DiagramResource } from "@/types/diagrams";
import {
  getDiagramsByUser,
  getDiagramById,
  createDiagram,
} from "@/lib/diagrams/client";

type DiagramState = {
  diagrams: DiagramResource[];
  selectedDiagram: DiagramResource | null;
  loading: boolean;
  error: string | null;
};

type DiagramActions = {
  setDiagrams: (diagrams: DiagramResource[]) => void;
  setSelectedDiagram: (diagram: DiagramResource | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchDiagrams: () => Promise<void>;
  fetchDiagramById: (diagramId: string) => Promise<void>;
  createDiagram: (payload: {
    name?: string | null;
    projectId?: string | null;
    data?: Record<string, any> | null;
    description?: string | null;
    thumbnail_url?: string | null;
    owner_name?: string | null;
    owner_username?: string | null;
    owner_avatar_url?: string | null;
  }) => Promise<DiagramResource | null>;
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
      set({ loading: true, error: null });
      try {
        const data = await createDiagram(payload);
        const diagram = data?.diagram ?? data ?? null;
        if (diagram) {
          set({ diagrams: [diagram, ...get().diagrams], loading: false });
        } else {
          set({ loading: false });
        }
        return diagram;
      } catch (err: any) {
        set({
          error: err?.message ?? "Failed to create diagram",
          loading: false,
        });
        return null;
      }
    },

    reset: () => set({ ...initialState }),
  }),
);
