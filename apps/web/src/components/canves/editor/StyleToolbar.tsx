"use client";

import type { CSSProperties } from "react";
import { useDiagramEditorStore } from "@/store/diagramEditorStore";
import {
  DEFAULT_NODE_STYLE,
  type NodeStyle,
} from "@/components/canves/nodes/types";
import {
  isFreehandNode,
  isShapeNode,
  mergeNodeStyle,
} from "./style-toolbar.shared";
import { NodeStyleSection } from "./node-style-section";
import { EdgeStyleSection } from "./edge-style-section";
import { FreehandStyleSection } from "./freehand-style-section";

export default function StyleToolbar() {
  const nodes = useDiagramEditorStore((state) => state.nodes);
  const edges = useDiagramEditorStore((state) => state.edges);
  const selectedNodeId = useDiagramEditorStore((state) => state.selectedNodeId);
  const selectedEdgeId = useDiagramEditorStore((state) => state.selectedEdgeId);
  const setNodes = useDiagramEditorStore((state) => state.setNodes);
  const setEdges = useDiagramEditorStore((state) => state.setEdges);
  const edgeVariant = useDiagramEditorStore((state) => state.edgeVariant);
  const edgeEndType = useDiagramEditorStore((state) => state.edgeEndType);
  const updateEdgeType = useDiagramEditorStore((state) => state.updateEdgeType);
  const updateSelectedEdgeVariant = useDiagramEditorStore(
    (state) => state.updateSelectedEdgeVariant,
  );
  const updateEdgeEndType = useDiagramEditorStore(
    (state) => state.updateEdgeEndType,
  );
  const updateSelectedEdgeEndType = useDiagramEditorStore(
    (state) => state.updateSelectedEdgeEndType,
  );

  const selectedNode = nodes.find((node) => node.id === selectedNodeId);
  const selectedShapeNode =
    selectedNode && isShapeNode(selectedNode) ? selectedNode : undefined;
  const selectedFreehandNode =
    selectedNode && isFreehandNode(selectedNode) ? selectedNode : undefined;
  const selectedEdge = edges.find((edge) => edge.id === selectedEdgeId);

  const selectedNodeStyle = selectedShapeNode?.data.style ?? DEFAULT_NODE_STYLE;
  const isTextNode = selectedShapeNode?.data.shape === "text";
  const selectedEdgeVariant =
    (selectedEdge?.data as { variant?: typeof edgeVariant } | undefined)
      ?.variant ?? edgeVariant;
  const selectedEdgeEndType =
    (selectedEdge?.data as { endType?: typeof edgeEndType } | undefined)
      ?.endType ?? edgeEndType;

  const updateSelectedNodeStyle = (patch: Partial<NodeStyle>) => {
    if (!selectedNodeId || !selectedShapeNode) return;

    setNodes((prevNodes) =>
      prevNodes.map((node) => {
        if (node.id !== selectedNodeId || !isShapeNode(node)) return node;

        return {
          ...node,
          data: {
            ...node.data,
            style: mergeNodeStyle(node.data.style, patch),
          },
        };
      }),
    );
  };

  const updateSelectedFreehandData = (patch: Record<string, unknown>) => {
    if (!selectedNodeId || !selectedFreehandNode) return;

    setNodes((prevNodes) =>
      prevNodes.map((node) =>
        node.id === selectedNodeId && isFreehandNode(node)
          ? {
              ...node,
              data: {
                ...(node.data ?? {}),
                ...patch,
              },
            }
          : node,
      ),
    );
  };

  const updateSelectedEdgeStyle = (patch: CSSProperties) => {
    if (!selectedEdgeId) return;

    setEdges((prevEdges) =>
      prevEdges.map((edge) =>
        edge.id === selectedEdgeId
          ? {
              ...edge,
              style: {
                ...(edge.style ?? {}),
                ...patch,
              },
            }
          : edge,
      ),
    );
  };

  const updateSelectedEdgeData = (patch: Record<string, unknown>) => {
    if (!selectedEdgeId) return;

    setEdges((prevEdges) =>
      prevEdges.map((edge) =>
        edge.id === selectedEdgeId
          ? {
              ...edge,
              data: {
                ...(edge.data ?? {}),
                ...patch,
              },
            }
          : edge,
      ),
    );
  };

  const updateSelectedEdgeAnimation = (isAnimated: boolean) => {
    if (!selectedEdgeId) return;

    setEdges((prevEdges) =>
      prevEdges.map((edge) =>
        edge.id === selectedEdgeId
          ? {
              ...edge,
              animated: isAnimated,
            }
          : edge,
      ),
    );
  };
  return (
    <aside className="scrollbar-minimal flex w-72 max-h-[calc(100vh-10rem)] flex-col gap-5 overflow-y-auto rounded-2xl border border-border/70 bg-background/95 p-5 shadow-lg backdrop-blur">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold">Style</h3>
        <p className="text-xs text-muted-foreground">
          Colors are shown by default. Select a shape for shape-specific
          options.
        </p>
      </div>

      {!selectedEdge && selectedShapeNode && (
        <NodeStyleSection
          selectedNode={selectedShapeNode}
          selectedNodeStyle={selectedNodeStyle}
          isTextNode={isTextNode}
          onUpdateNodeStyle={updateSelectedNodeStyle}
        />
      )}

      {!selectedEdge && selectedFreehandNode && (
        <FreehandStyleSection
          selectedNode={selectedFreehandNode}
          onUpdateStroke={(stroke) => updateSelectedFreehandData({ stroke })}
          onUpdateStrokeWidth={(strokeWidth) =>
            updateSelectedFreehandData({ strokeWidth })
          }
        />
      )}

      <EdgeStyleSection
        selectedEdge={selectedEdge}
        selectedEdgeId={selectedEdgeId}
        selectedEdgeVariant={selectedEdgeVariant}
        selectedEdgeEndType={selectedEdgeEndType}
        onUpdateEdgeType={updateEdgeType}
        onUpdateSelectedEdgeVariant={updateSelectedEdgeVariant}
        onUpdateEdgeEndType={updateEdgeEndType}
        onUpdateSelectedEdgeEndType={updateSelectedEdgeEndType}
        onUpdateSelectedEdgeStyle={updateSelectedEdgeStyle}
        onUpdateSelectedEdgeAnimation={updateSelectedEdgeAnimation}
        onUpdateSelectedEdgeData={updateSelectedEdgeData}
      />
    </aside>
  );
}
