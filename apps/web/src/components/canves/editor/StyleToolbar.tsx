"use client";

import type { CSSProperties } from "react";
import {
  ArrowRight,
  Circle,
  Minus,
  Square,
  CornerDownRight,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { edgeVariants, type EdgeEndType } from "@/components/canves/edges";
import { useDiagramEditorStore } from "@/store/diagramEditorStore";
import {
  DEFAULT_NODE_STYLE,
  type NodeStyle,
  type ShapeNodeType,
} from "@/components/canves/nodes/types";
import type { CustomNodeType } from "@/components/canves/nodes";
import { ColorOptionPicker } from "./color-option-picker";

const RADIUS_OPTIONS = [
  { id: "sharp", value: 0, icon: "square" },
  { id: "rounded", value: 16, icon: "rounded" },
  { id: "pill", value: 999, icon: "pill" },
] as const;

const THICKNESS_OPTIONS = [
  { id: "thin", value: 1 },
  { id: "medium", value: 2 },
  { id: "thick", value: 4 },
] as const;

const EDGE_END_OPTIONS: {
  id: EdgeEndType;
  icon: "none" | "arrow" | "arrowclosed";
}[] = [
  { id: "none", icon: "none" },
  { id: "arrow", icon: "arrow" },
  { id: "arrowclosed", icon: "arrowclosed" },
];

function normalizeHex(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const withHash = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
  return /^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(withHash)
    ? withHash.toLowerCase()
    : null;
}

function isShapeNode(node: CustomNodeType): node is ShapeNodeType {
  return node.type === "shape-node";
}

function mergeNodeStyle(
  style: ShapeNodeType["data"]["style"],
  patch: Partial<NodeStyle>,
): NodeStyle {
  return {
    ...(style ?? DEFAULT_NODE_STYLE),
    ...patch,
  };
}

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

  const selectedNode = nodes.find(
    (node): node is ShapeNodeType =>
      node.id === selectedNodeId && isShapeNode(node),
  );
  const selectedEdge = edges.find((edge) => edge.id === selectedEdgeId);
  const selectedNodeStyle = selectedNode?.data.style ?? DEFAULT_NODE_STYLE;
  const isTextNode = selectedNode?.data.shape === "text";
  const selectedEdgeVariant =
    (selectedEdge?.data as { variant?: string } | undefined)?.variant ??
    edgeVariant;
  const selectedEdgeEndType =
    (selectedEdge?.data as { endType?: EdgeEndType } | undefined)?.endType ??
    edgeEndType;

  const updateSelectedNodeStyle = (patch: Partial<NodeStyle>) => {
    if (!selectedNodeId) return;

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

  return (
    <aside className="scrollbar-minimal flex w-72 max-h-[calc(100vh-10rem)] flex-col gap-5 overflow-y-auto rounded-2xl border border-border/70 bg-background/95 p-5 shadow-lg backdrop-blur">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold">Style</h3>
        <p className="text-xs text-muted-foreground">
          Colors are shown by default. Select a shape for shape-specific
          options.
        </p>
      </div>

      {!selectedEdge && (
        <div className="flex flex-col gap-2">
          <Label>Stroke</Label>
          <div
            className={cn(!selectedNode && "pointer-events-none opacity-60")}
          >
            <ColorOptionPicker
              value={selectedNodeStyle.borderColor}
              onChange={(color) =>
                updateSelectedNodeStyle({ borderColor: color })
              }
            />
          </div>
        </div>
      )}

      {!selectedEdge && (
        <div className="flex flex-col gap-2">
          <Label>Background</Label>
          <div
            className={cn(
              (!selectedNode || isTextNode) && "pointer-events-none opacity-60",
            )}
          >
            <ColorOptionPicker
              value={selectedNodeStyle.backgroundColor}
              onChange={(color) =>
                updateSelectedNodeStyle({ backgroundColor: color })
              }
              includeTransparent
            />
          </div>
        </div>
      )}

      {selectedNode && !isTextNode && (
        <>
          <div className="flex flex-col gap-2">
            <Label>Border Style</Label>
            <div className="flex items-center gap-2">
              {(["solid", "dashed", "dotted"] as const).map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() =>
                    updateSelectedNodeStyle({
                      borderStyle: style,
                    })
                  }
                  className={cn(
                    "flex h-9 w-12 items-center justify-center rounded-md border",
                    selectedNodeStyle.borderStyle === style
                      ? "border-primary bg-primary/10"
                      : "border-border",
                  )}
                >
                  <span
                    className="h-0 w-7 border-t-2 border-foreground"
                    style={{ borderTopStyle: style }}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Border Radius</Label>
            <div className="flex items-center gap-2">
              {RADIUS_OPTIONS.map((option) => {
                const active =
                  option.id === "pill"
                    ? selectedNodeStyle.borderRadius >= option.value
                    : selectedNodeStyle.borderRadius === option.value;

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() =>
                      updateSelectedNodeStyle({
                        borderRadius: option.value,
                      })
                    }
                    className={cn(
                      "flex size-10 items-center justify-center rounded-md border",
                      active ? "border-primary bg-primary/10" : "border-border",
                    )}
                  >
                    <div
                      className={cn(
                        "h-5 w-5 border border-current",
                        option.id === "sharp" && "rounded-none",
                        option.id === "rounded" && "rounded-sm",
                        option.id === "pill" && "rounded-md",
                      )}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Thickness</Label>
            <div className="flex items-center gap-2">
              {THICKNESS_OPTIONS.map((option) => (
                <button
                  key={`node-thickness-${option.id}`}
                  type="button"
                  onClick={() =>
                    updateSelectedNodeStyle({
                      borderWidth: option.value,
                    })
                  }
                  className={cn(
                    "flex h-9 w-12 items-center justify-center rounded-md border",
                    selectedNodeStyle.borderWidth === option.value
                      ? "border-primary bg-primary/10"
                      : "border-border",
                  )}
                >
                  <span
                    className="h-0 w-7 border-t border-foreground"
                    style={{ borderTopWidth: option.value }}
                  />
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="flex flex-col gap-2">
        <Label>Edge Type</Label>
        <div className="flex items-center gap-2">
          {edgeVariants.map((edge) => (
            <button
              key={edge.id}
              type="button"
              onClick={() => {
                updateEdgeType(edge.id);
                if (selectedEdgeId) {
                  updateSelectedEdgeVariant(edge.id);
                }
              }}
              className={cn(
                "flex size-10 items-center justify-center rounded-md border",
                selectedEdgeVariant === edge.id
                  ? "border-primary bg-primary/10"
                  : "border-border",
              )}
            >
              <edge.icon className="size-4" />
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label>Edge End</Label>
        <div className="flex items-center gap-2">
          {EDGE_END_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                updateEdgeEndType(option.id);
                if (selectedEdgeId) {
                  updateSelectedEdgeEndType(option.id);
                }
              }}
              className={cn(
                "flex size-10 items-center justify-center rounded-md border",
                selectedEdgeEndType === option.id
                  ? "border-primary bg-primary/10"
                  : "border-border",
              )}
            >
              {option.icon === "none" ? (
                <Minus className="size-4" />
              ) : option.icon === "arrow" ? (
                <ArrowRight className="size-4" />
              ) : (
                <span className="inline-block h-0 w-0 border-y-4 border-y-transparent border-l-[7px] border-l-foreground" />
              )}
            </button>
          ))}
        </div>
      </div>

      {selectedEdge && (
        <>
          <div className="flex flex-col gap-2">
            <Label>Edge Color</Label>
            <ColorOptionPicker
              value={
                normalizeHex(String(selectedEdge.style?.stroke ?? "")) ??
                "#111827"
              }
              onChange={(color) => updateSelectedEdgeStyle({ stroke: color })}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Thickness</Label>
            <div className="flex items-center gap-2">
              {THICKNESS_OPTIONS.map((option) => (
                <button
                  key={`edge-thickness-${option.id}`}
                  type="button"
                  onClick={() =>
                    updateSelectedEdgeStyle({
                      strokeWidth: option.value,
                    })
                  }
                  className={cn(
                    "flex h-9 w-12 items-center justify-center rounded-md border",
                    Number(selectedEdge.style?.strokeWidth ?? 1) ===
                      option.value
                      ? "border-primary bg-primary/10"
                      : "border-border",
                  )}
                >
                  <span
                    className="h-0 w-7 border-t border-foreground"
                    style={{ borderTopWidth: option.value }}
                  />
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </aside>
  );
}
