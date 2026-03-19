"use client";

import { create } from "zustand";
import type { Viewport } from "@xyflow/react";
import type {
  CustomEdgeType,
  EdgeEndType,
  EdgeVariantType,
} from "@/components/canves/edges";
import type { CustomNodeType } from "@/components/canves/nodes";
import type { DiagramToolId } from "@/components/canves/editor/tools";

export type DiagramEditorData = {
  nodes: CustomNodeType[];
  edges: CustomEdgeType[];
  viewport: Viewport;
  edgeVariant: EdgeVariantType;
  edgeEndType: EdgeEndType;
};

type DiagramHistorySnapshot = DiagramEditorData;

type DiagramEditorState = DiagramEditorData & {
  activeTool: DiagramToolId;
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  isDirty: boolean;
  historyPast: DiagramHistorySnapshot[];
  historyFuture: DiagramHistorySnapshot[];
};

type Updater<T> = T | ((prev: T) => T);

type DiagramEditorActions = {
  setActiveTool: (tool: DiagramToolId) => void;

  setNodes: (
    nodes: Updater<CustomNodeType[]>,
    options?: { markDirty?: boolean },
  ) => void;

  setEdges: (
    edges: Updater<CustomEdgeType[]>,
    options?: { markDirty?: boolean },
  ) => void;

  applyChanges: (
    updater: (state: DiagramEditorState) => Partial<DiagramEditorState>,
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

  updateEdgeType: (variant: EdgeVariantType) => void;
  updateSelectedEdgeVariant: (variant: EdgeVariantType) => void;
  updateEdgeEndType: (endType: EdgeEndType) => void;
  updateSelectedEdgeEndType: (endType: EdgeEndType) => void;
  undo: () => void;
  redo: () => void;
};

const defaultViewport: Viewport = { x: 0, y: 0, zoom: 1 };
const HISTORY_LIMIT = 100;

const initialState: DiagramEditorState = {
  activeTool: "select",
  nodes: [],
  edges: [],
  viewport: defaultViewport,
  selectedNodeId: null,
  selectedEdgeId: null,
  isDirty: false,
  edgeVariant: "bezier",
  edgeEndType: "arrowclosed",
  historyPast: [],
  historyFuture: [],
};

// 🔥 helpers
function resolveUpdater<T>(value: Updater<T>, prev: T): T {
  return typeof value === "function" ? (value as (p: T) => T)(prev) : value;
}

function applyWithDirty<T>(
  prev: T,
  value: Updater<T>,
  options?: { markDirty?: boolean },
) {
  const next = resolveUpdater(value, prev);
  const shouldMarkDirty = options?.markDirty !== false;

  return {
    next,
    isDirty: shouldMarkDirty ? true : undefined,
  };
}

function cloneSnapshot(
  snapshot: DiagramHistorySnapshot,
): DiagramHistorySnapshot {
  return {
    nodes: snapshot.nodes.map((node) => ({
      ...node,
      position: { ...node.position },
      data:
        node.data && typeof node.data === "object"
          ? ({ ...(node.data as Record<string, unknown>) } as typeof node.data)
          : node.data,
      style: node.style ? { ...node.style } : node.style,
    })) as CustomNodeType[],
    edges: snapshot.edges.map((edge) => ({
      ...edge,
      data:
        edge.data && typeof edge.data === "object"
          ? ({ ...(edge.data as Record<string, unknown>) } as typeof edge.data)
          : edge.data,
      style: edge.style ? { ...edge.style } : edge.style,
    })) as CustomEdgeType[],
    viewport: { ...snapshot.viewport },
    edgeVariant: snapshot.edgeVariant,
    edgeEndType: snapshot.edgeEndType,
  };
}

function createHistorySnapshot(
  state: DiagramEditorState,
): DiagramHistorySnapshot {
  return cloneSnapshot({
    nodes: state.nodes,
    edges: state.edges,
    viewport: state.viewport,
    edgeVariant: state.edgeVariant,
    edgeEndType: state.edgeEndType,
  });
}

function pushPastHistory(
  historyPast: DiagramHistorySnapshot[],
  snapshot: DiagramHistorySnapshot,
) {
  const next = [...historyPast, snapshot];
  if (next.length <= HISTORY_LIMIT) return next;
  return next.slice(next.length - HISTORY_LIMIT);
}

function isSameViewport(a: Viewport, b: Viewport) {
  return a.x === b.x && a.y === b.y && a.zoom === b.zoom;
}

export const useDiagramEditorStore = create<
  DiagramEditorState & DiagramEditorActions
>((set) => ({
  ...initialState,

  setActiveTool: (activeTool) => set({ activeTool }),

  // ✅ unified logic
  setNodes: (nodes, options) =>
    set((state) => {
      const { next, isDirty } = applyWithDirty(state.nodes, nodes, options);
      const shouldTrackHistory =
        options?.markDirty !== false && next !== state.nodes;
      const historyPast = shouldTrackHistory
        ? pushPastHistory(state.historyPast, createHistorySnapshot(state))
        : state.historyPast;

      return {
        nodes: next,
        isDirty: isDirty ?? state.isDirty,
        historyPast,
        historyFuture: shouldTrackHistory ? [] : state.historyFuture,
      };
    }),

  setEdges: (edges, options) =>
    set((state) => {
      const { next, isDirty } = applyWithDirty(state.edges, edges, options);
      const shouldTrackHistory =
        options?.markDirty !== false && next !== state.edges;
      const historyPast = shouldTrackHistory
        ? pushPastHistory(state.historyPast, createHistorySnapshot(state))
        : state.historyPast;

      return {
        edges: next,
        isDirty: isDirty ?? state.isDirty,
        historyPast,
        historyFuture: shouldTrackHistory ? [] : state.historyFuture,
      };
    }),

  // 🔥 atomic updates (important)
  applyChanges: (updater) =>
    set((state) => {
      const historyPast = pushPastHistory(
        state.historyPast,
        createHistorySnapshot(state),
      );

      return {
        ...updater(state),
        isDirty: true,
        historyPast,
        historyFuture: [],
      };
    }),

  setViewport: (viewport) =>
    set((state) => {
      if (isSameViewport(state.viewport, viewport)) return state;

      return {
        viewport,
        isDirty: true,
        historyPast: pushPastHistory(
          state.historyPast,
          createHistorySnapshot(state),
        ),
        historyFuture: [],
      };
    }),

  updateNodeData: (nodeId, data) =>
    set((state) => {
      const nodes: CustomNodeType[] = state.nodes.map(
        (node): CustomNodeType => {
          if (node.id !== nodeId) return node;

          return {
            ...node,
            data: {
              ...((node.data ?? {}) as Record<string, unknown>),
              ...data,
            },
          } as CustomNodeType;
        },
      );

      return {
        nodes,
        isDirty: true,
        historyPast: pushPastHistory(
          state.historyPast,
          createHistorySnapshot(state),
        ),
        historyFuture: [],
      };
    }),

  updateNodeSize: (nodeId, width, height) =>
    set((state) => {
      let changed = false;

      const nodes = state.nodes.map((node) => {
        if (node.id !== nodeId) return node;

        if (node.style?.width === width && node.style?.height === height)
          return node;

        changed = true;

        return {
          ...node,
          style: { ...node.style, width, height },
        };
      });

      return changed
        ? {
            nodes,
            isDirty: true,
            historyPast: pushPastHistory(
              state.historyPast,
              createHistorySnapshot(state),
            ),
            historyFuture: [],
          }
        : state;
    }),

  addNode: (node) =>
    set((state) => ({
      nodes: [...state.nodes, node],
      selectedNodeId: node.id,
      selectedEdgeId: null,
      isDirty: true,
      historyPast: pushPastHistory(
        state.historyPast,
        createHistorySnapshot(state),
      ),
      historyFuture: [],
    })),

  addEdge: (edge) =>
    set((state) => ({
      edges: [...state.edges, edge],
      selectedEdgeId: edge.id,
      selectedNodeId: null,
      isDirty: true,
      historyPast: pushPastHistory(
        state.historyPast,
        createHistorySnapshot(state),
      ),
      historyFuture: [],
    })),

  removeNode: (nodeId) =>
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== nodeId),
      edges: state.edges.filter(
        (e) => e.source !== nodeId && e.target !== nodeId,
      ),
      selectedNodeId:
        state.selectedNodeId === nodeId ? null : state.selectedNodeId,
      isDirty: true,
      historyPast: pushPastHistory(
        state.historyPast,
        createHistorySnapshot(state),
      ),
      historyFuture: [],
    })),

  removeEdge: (edgeId) =>
    set((state) => ({
      edges: state.edges.filter((e) => e.id !== edgeId),
      selectedEdgeId:
        state.selectedEdgeId === edgeId ? null : state.selectedEdgeId,
      isDirty: true,
      historyPast: pushPastHistory(
        state.historyPast,
        createHistorySnapshot(state),
      ),
      historyFuture: [],
    })),

  setSelectedNodeId: (selectedNodeId) =>
    set({ selectedNodeId, selectedEdgeId: null }),

  setSelectedEdgeId: (selectedEdgeId) =>
    set({ selectedEdgeId, selectedNodeId: null }),

  clearSelection: () => set({ selectedNodeId: null, selectedEdgeId: null }),

  loadDiagramData: (data) =>
    set({
      nodes: Array.isArray(data?.nodes) ? data.nodes : [],
      edges: Array.isArray(data?.edges) ? data.edges : [],
      viewport: data?.viewport ?? defaultViewport,
      selectedNodeId: null,
      selectedEdgeId: null,
      isDirty: false,
      historyPast: [],
      historyFuture: [],
    }),

  markSaved: () => set({ isDirty: false }),

  reset: () => set({ ...initialState }),

  updateEdgeType: (variant) => set({ edgeVariant: variant }),
  updateEdgeEndType: (endType) => set({ edgeEndType: endType }),

  updateSelectedEdgeVariant: (variant) =>
    set((state) => ({
      edges: state.edges.map((edge) =>
        edge.id === state.selectedEdgeId
          ? {
              ...edge,
              data: { ...(edge.data ?? {}), variant },
            }
          : edge,
      ),
      isDirty: true,
      historyPast: pushPastHistory(
        state.historyPast,
        createHistorySnapshot(state),
      ),
      historyFuture: [],
    })),
  updateSelectedEdgeEndType: (endType) =>
    set((state) => ({
      edges: state.edges.map((edge) =>
        edge.id === state.selectedEdgeId
          ? {
              ...edge,
              data: { ...(edge.data ?? {}), endType },
            }
          : edge,
      ),
      isDirty: true,
      historyPast: pushPastHistory(
        state.historyPast,
        createHistorySnapshot(state),
      ),
      historyFuture: [],
    })),
  undo: () =>
    set((state) => {
      if (state.historyPast.length === 0) return state;

      const previousSnapshot = state.historyPast[state.historyPast.length - 1];
      const historyPast = state.historyPast.slice(0, -1);
      const historyFuture = [
        createHistorySnapshot(state),
        ...state.historyFuture,
      ].slice(0, HISTORY_LIMIT);

      return {
        nodes: previousSnapshot.nodes,
        edges: previousSnapshot.edges,
        viewport: previousSnapshot.viewport,
        edgeVariant: previousSnapshot.edgeVariant,
        edgeEndType: previousSnapshot.edgeEndType,
        selectedNodeId: null,
        selectedEdgeId: null,
        isDirty: true,
        historyPast,
        historyFuture,
      };
    }),
  redo: () =>
    set((state) => {
      if (state.historyFuture.length === 0) return state;

      const nextSnapshot = state.historyFuture[0];
      const historyFuture = state.historyFuture.slice(1);
      const historyPast = pushPastHistory(
        state.historyPast,
        createHistorySnapshot(state),
      );

      return {
        nodes: nextSnapshot.nodes,
        edges: nextSnapshot.edges,
        viewport: nextSnapshot.viewport,
        edgeVariant: nextSnapshot.edgeVariant,
        edgeEndType: nextSnapshot.edgeEndType,
        selectedNodeId: null,
        selectedEdgeId: null,
        isDirty: true,
        historyPast,
        historyFuture,
      };
    }),
}));
