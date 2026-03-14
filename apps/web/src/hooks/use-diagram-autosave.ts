"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Edge, Node, Viewport } from "@xyflow/react";
import { useDiagramStore } from "@/store/diagramsStore";
import { useDiagramEditorStore } from "@/store/diagramEditorStore";

type SaveStatus = "idle" | "pending" | "saving" | "saved" | "error";

type UseDiagramAutosaveResult = {
  saveStatus: SaveStatus;
  saveMessage: string | null;
};

type PersistedDiagramPayload = {
  nodes: Node[];
  edges: Edge[];
  viewport: Viewport;
};

function sanitizeNodes(nodes: Node[]): Node[] {
  return nodes.map((node) => {
    const {
      measured: _measured,
      selected: _selected,
      dragging: _dragging,
      resizing: _resizing,
      width: _width,
      height: _height,
      initialWidth: _initialWidth,
      initialHeight: _initialHeight,
      ...persistedNode
    } = node;

    return persistedNode;
  });
}

function sanitizeEdges(edges: Edge[]): Edge[] {
  return edges.map((edge) => {
    const { selected: _selected, ...persistedEdge } = edge;

    return persistedEdge;
  });
}

export function useDiagramAutosave(
  diagramId: string | null,
  enabled: boolean,
): UseDiagramAutosaveResult {
  const nodes = useDiagramEditorStore((state) => state.nodes);
  const edges = useDiagramEditorStore((state) => state.edges);
  const viewport = useDiagramEditorStore((state) => state.viewport);
  const isDirty = useDiagramEditorStore((state) => state.isDirty);
  const markSaved = useDiagramEditorStore((state) => state.markSaved);
  const updateDiagramData = useDiagramStore((state) => state.updateDiagramData);
  const setDiagramActiveState = useDiagramStore(
    (state) => state.setDiagramActiveState,
  );
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestPayloadRef = useRef<PersistedDiagramPayload>({
    nodes: sanitizeNodes(nodes),
    edges: sanitizeEdges(edges),
    viewport,
  });
  const latestDirtyRef = useRef(isDirty);
  const latestEnabledRef = useRef(enabled);
  const latestDiagramIdRef = useRef(diagramId);
  const isSavingRef = useRef(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    latestPayloadRef.current = {
      nodes: sanitizeNodes(nodes),
      edges: sanitizeEdges(edges),
      viewport,
    };
  }, [edges, nodes, viewport]);

  useEffect(() => {
    latestDirtyRef.current = isDirty;
  }, [isDirty]);

  useEffect(() => {
    latestEnabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    latestDiagramIdRef.current = diagramId;
  }, [diagramId]);

  const flushSave = useCallback(async () => {
    const currentDiagramId = latestDiagramIdRef.current;

    if (
      !currentDiagramId ||
      !latestEnabledRef.current ||
      !latestDirtyRef.current ||
      isSavingRef.current
    ) {
      return;
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }

    isSavingRef.current = true;
    setSaveStatus("saving");
    setSaveMessage(null);

    const result = await updateDiagramData(
      currentDiagramId,
      latestPayloadRef.current,
    );

    if (result.success) {
      markSaved();
      latestDirtyRef.current = false;
      setSaveStatus("saved");
      setSaveMessage(result.message ?? "Saved");
    } else {
      setSaveStatus("error");
      setSaveMessage(result.message ?? "Autosave failed");
    }

    isSavingRef.current = false;
  }, [markSaved, updateDiagramData]);

  useEffect(() => {
    if (!diagramId || !enabled) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
      isSavingRef.current = false;
      setSaveStatus("idle");
      setSaveMessage(null);
      return;
    }

    let active = true;

    void (async () => {
      const result = await setDiagramActiveState(diagramId, true);

      if (!active) {
        return;
      }

      if (!result.success) {
        setSaveStatus("error");
        setSaveMessage(result.message ?? "Failed to activate editor");
      }
    })();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        void flushSave();
      }
    };

    const handlePageHide = () => {
      void flushSave();
    };

    const handleBeforeUnload = () => {
      void flushSave();
    };

    const handlePopState = () => {
      void flushSave();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    return () => {
      active = false;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
      void flushSave();
      void setDiagramActiveState(diagramId, false);
    };
  }, [diagramId, enabled, flushSave, setDiagramActiveState]);

  useEffect(() => {
    if (!diagramId || !enabled || !isDirty) {
      return;
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    setSaveStatus("pending");
    setSaveMessage(null);

    saveTimeoutRef.current = setTimeout(() => {
      saveTimeoutRef.current = null;
      void flushSave();
    }, 5000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
    };
  }, [diagramId, enabled, isDirty, nodes, edges, viewport, flushSave]);

  return { saveStatus, saveMessage };
}
