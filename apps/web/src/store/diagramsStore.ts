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
import { getErrorMessage } from "@/lib/error-utils";

type DiagramsResponse = {
  data: { diagrams: DiagramResource[] };
  message?: string;
};
type DiagramResponse = { data: { diagram: DiagramResource }; message?: string };
type DiagramOwnershipResponse = {
  data: { isOwner: boolean };
  message?: string;
};

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
        const data = (await getDiagramsByUser()) as DiagramsResponse;
        set({ diagrams: data?.data?.diagrams ?? [], loading: false });
      } catch (err: unknown) {
        set({
          error: getErrorMessage(err, "Failed to fetch diagrams"),
          loading: false,
        });
      }
    },
    fetchProjectDiagrams: async (projectId) => {
      set({ loading: true, error: null });
      try {
        const data = (await getProjectDiagrams(projectId)) as DiagramsResponse;

        set({ diagrams: data?.data?.diagrams ?? [], loading: false });
      } catch (err: unknown) {
        set({
          error: getErrorMessage(err, "Failed to fetch project diagrams"),
          loading: false,
        });
      }
    },

    fetchTrashDiagrams: async () => {
      set({ loading: true, error: null });
      try {
        const data = (await getSoftDeletedDiagrams()) as DiagramsResponse;
        set({ diagrams: data?.data?.diagrams ?? [], loading: false });
      } catch (err: unknown) {
        set({
          error: getErrorMessage(err, "Failed to fetch deleted diagrams"),
          loading: false,
        });
      }
    },

    fetchDiagramById: async (diagramId) => {
      set({ loading: true, error: null });
      try {
        const data = (await getDiagramById(diagramId)) as DiagramResponse;
        const diagram = data?.data?.diagram ?? null;
        set({ selectedDiagram: diagram, loading: false });
      } catch (err: unknown) {
        set({
          error: getErrorMessage(err, "Failed to fetch diagram"),
          loading: false,
        });
      }
    },

    createDiagram: async (payload) => {
      try {
        const data = (await createDiagram(payload)) as DiagramResponse;
        const diagram = data?.data?.diagram ?? null;
        const message = data?.message ?? "Diagram created successfully";

        if (!diagram) {
          return { success: false, message: "Failed to create diagram" };
        }

        set({ diagrams: [diagram, ...get().diagrams] });

        return { success: true, diagram, message };
      } catch (err: unknown) {
        return {
          success: false,
          message: getErrorMessage(err, "Failed to create diagram"),
        };
      }
    },
    updateDiagram: async (payload, diagramId) => {
      try {
        const data = (await updateDiagram(
          payload,
          diagramId,
        )) as DiagramResponse;
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
      } catch (err: unknown) {
        return {
          success: false,
          message: getErrorMessage(err, "Failed to update diagram"),
        };
      }
    },
    updateDiagramData: async (diagramId, dataPayload) => {
      try {
        const data = (await updateDiagramDataRequest(
          diagramId,
          dataPayload,
        )) as DiagramResponse;
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
      } catch (err: unknown) {
        return {
          success: false,
          message: getErrorMessage(err, "Failed to update diagram data"),
        };
      }
    },
    setDiagramActiveState: async (diagramId, isActive) => {
      try {
        const data = (await setDiagramActiveStateRequest(diagramId, {
          is_active: isActive,
        })) as DiagramResponse;
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
      } catch (err: unknown) {
        return {
          success: false,
          message: getErrorMessage(err, "Failed to update active status"),
        };
      }
    },

    reset: () => set({ ...initialState }),
    verifyDiagramOwnership: async (diagramId) => {
      try {
        const data = (await VerifyOwnerOfDiagram(
          diagramId,
        )) as DiagramOwnershipResponse;

        if (!data) return false;
        return Boolean(data?.data?.isOwner);
      } catch (err: unknown) {
        set({
          error: getErrorMessage(err, "Failed to verify diagram ownership"),
        });
        return false;
      }
    },
  }),
);
