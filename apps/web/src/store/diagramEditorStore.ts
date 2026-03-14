"use client";

import type { CSSProperties } from "react";
import { create } from "zustand";
import type { Viewport } from "@xyflow/react";
import type { CustomEdgeType } from "@/components/edges";
import type { CustomNodeType } from "@/components/nodes";
import type { DiagramToolId } from "@/components/canves/editor/tools";

export type DiagramEditorData = {
  nodes: CustomNodeType[];
  edges: CustomEdgeType[];
  viewport: Viewport;
};

type DiagramEditorState = DiagramEditorData & {
  activeTool: DiagramToolId;
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  isDirty: boolean;
};

type DiagramEditorActions = {
  setActiveTool: (tool: DiagramToolId) => void;
  setNodes: (
    nodes: CustomNodeType[],
    options?: { markDirty?: boolean },
  ) => void;
  setEdges: (
    edges: CustomEdgeType[],
    options?: { markDirty?: boolean },
  ) => void;
  setViewport: (viewport: Viewport) => void;
  updateNodeData: (nodeId: string, data: Record<string, unknown>) => void;
  updateNodeSize: (nodeId: string, width: number, height: number) => void;
  addNode: (node: CustomNodeType) => void;
  addEdge: (edge: CustomEdgeType) => void;
  removeNode: (nodeId: string) => void;
  removeEdge: (edgeId: string) => void;
  setSelectedNodeId: (nodeId: string | null) => void;
  setSelectedEdgeId: (edgeId: string | null) => void;
  clearSelection: () => void;
  loadDiagramData: (data?: Partial<DiagramEditorData> | null) => void;
  markSaved: () => void;
  reset: () => void;
};

const defaultViewport: Viewport = {
  x: 0,
  y: 0,
  zoom: 1,
};

function isSameViewport(a: Viewport, b: Viewport) {
  return a.x === b.x && a.y === b.y && a.zoom === b.zoom;
}

function isSameNodeStyleSize(
  style: CSSProperties | undefined,
  width: number,
  height: number,
) {
  return style?.width === width && style?.height === height;
}

const initialState: DiagramEditorState = {
  activeTool: "select",
  nodes: [],
  edges: [],
  viewport: defaultViewport,
  selectedNodeId: null,
  selectedEdgeId: null,
  isDirty: false,
};

function isNodeArray(value: unknown): value is CustomNodeType[] {
  return Array.isArray(value);
}

function isEdgeArray(value: unknown): value is CustomEdgeType[] {
  return Array.isArray(value);
}

function normalizeViewport(value: unknown): Viewport {
  if (!value || typeof value !== "object") {
    return defaultViewport;
  }

  const candidate = value as Partial<Viewport>;

  return {
    x: typeof candidate.x === "number" ? candidate.x : defaultViewport.x,
    y: typeof candidate.y === "number" ? candidate.y : defaultViewport.y,
    zoom:
      typeof candidate.zoom === "number"
        ? candidate.zoom
        : defaultViewport.zoom,
  };
}

export const useDiagramEditorStore = create<
  DiagramEditorState & DiagramEditorActions
>((set) => ({
  ...initialState,

  setActiveTool: (activeTool) => set({ activeTool }),

  setNodes: (nodes, options) =>
    set((state) => ({
      nodes,
      isDirty: options?.markDirty === false ? state.isDirty : true,
    })),

  setEdges: (edges, options) =>
    set((state) => ({
      edges,
      isDirty: options?.markDirty === false ? state.isDirty : true,
    })),

  setViewport: (viewport) =>
    set((state) => {
      if (isSameViewport(state.viewport, viewport)) {
        return state;
      }

      return {
        viewport,
        isDirty: true,
      };
    }),

  updateNodeData: (nodeId, data) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...(typeof node.data === "object" && node.data
                  ? node.data
                  : {}),
                ...data,
              },
            }
          : node,
      ),
      isDirty: true,
    })),

  updateNodeSize: (nodeId, width, height) =>
    set((state) => {
      let didChange = false;

      const nodes = state.nodes.map((node) => {
        if (node.id !== nodeId) {
          return node;
        }

        if (isSameNodeStyleSize(node.style, width, height)) {
          return node;
        }

        didChange = true;

        return {
          ...node,
          style: {
            ...node.style,
            width,
            height,
          },
        };
      });

      if (!didChange) {
        return state;
      }

      return {
        nodes,
        isDirty: true,
      };
    }),

  addNode: (node) =>
    set((state) => ({
      nodes: [...state.nodes, node],
      selectedNodeId: node.id,
      selectedEdgeId: null,
      isDirty: true,
    })),

  addEdge: (edge) =>
    set((state) => ({
      edges: [...state.edges, edge],
      selectedEdgeId: edge.id,
      selectedNodeId: null,
      isDirty: true,
    })),

  removeNode: (nodeId) =>
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== nodeId),
      edges: state.edges.filter(
        (edge) => edge.source !== nodeId && edge.target !== nodeId,
      ),
      selectedNodeId:
        state.selectedNodeId === nodeId ? null : state.selectedNodeId,
      isDirty: true,
    })),

  removeEdge: (edgeId) =>
    set((state) => ({
      edges: state.edges.filter((edge) => edge.id !== edgeId),
      selectedEdgeId:
        state.selectedEdgeId === edgeId ? null : state.selectedEdgeId,
      isDirty: true,
    })),

  setSelectedNodeId: (selectedNodeId) =>
    set({
      selectedNodeId,
      selectedEdgeId: null,
    }),

  setSelectedEdgeId: (selectedEdgeId) =>
    set({
      selectedEdgeId,
      selectedNodeId: null,
    }),

  clearSelection: () =>
    set({
      selectedNodeId: null,
      selectedEdgeId: null,
    }),

  loadDiagramData: (data) =>
    set({
      nodes: isNodeArray(data?.nodes) ? data.nodes : [],
      edges: isEdgeArray(data?.edges) ? data.edges : [],
      viewport: normalizeViewport(data?.viewport),
      selectedNodeId: null,
      selectedEdgeId: null,
      isDirty: false,
    }),

  markSaved: () => set({ isDirty: false }),

  reset: () => set({ ...initialState }),
}));
