// nodes/types.ts
import { Node } from "@xyflow/react";

export type ShapeKind = "text" | "rectangle" | "diamond" | "circle" | "line";

export type NodeStyle = {
  borderStyle: "dashed" | "dotted" | "solid";
  borderWidth: number;
  borderRadius: number;
  borderColor: string;
  backgroundColor: string;
  fontSize: number;
};

export const DEFAULT_NODE_STYLE: NodeStyle = {
  borderStyle: "dashed",
  borderWidth: 2,
  borderRadius: 16,
  borderColor: "hsl(var(--border))",
  backgroundColor: "hsl(var(--background))",
  fontSize: 14,
};

export type ShapeNodeData = {
  label?: string;
  shape?: ShapeKind;
  style?: NodeStyle;
  type: "erasable-node";
};

export type ShapeNodeType = Node<ShapeNodeData, "shape-node">;
