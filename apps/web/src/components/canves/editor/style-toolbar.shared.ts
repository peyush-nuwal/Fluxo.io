"use client";

import type { CustomNodeType } from "@/components/canves/nodes";
import {
  DEFAULT_NODE_STYLE,
  type NodeStyle,
  type ShapeNodeType,
} from "@/components/canves/nodes/types";
import type { FreehandNodeType } from "@/components/canves/nodes/freehandNode";
import type { EdgeEndType } from "@/components/canves/edges";

export const RADIUS_OPTIONS = [
  { id: "sharp", value: 0 },
  { id: "rounded", value: 16 },
  { id: "pill", value: 999 },
] as const;

export const THICKNESS_OPTIONS = [
  { id: "thin", value: 1 },
  { id: "medium", value: 2 },
  { id: "thick", value: 4 },
] as const;

export const TEXT_SIZE_OPTIONS = [
  { id: "sm", value: 12 },
  { id: "md", value: 14 },
  { id: "lg", value: 18 },
] as const;

export const EDGE_END_OPTIONS: {
  id: EdgeEndType;
  icon: "none" | "arrow" | "arrowclosed";
}[] = [
  { id: "none", icon: "none" },
  { id: "arrow", icon: "arrow" },
  { id: "arrowclosed", icon: "arrowclosed" },
];

export function normalizeHex(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const withHash = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
  return /^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(withHash)
    ? withHash.toLowerCase()
    : null;
}

export function isShapeNode(node: CustomNodeType): node is ShapeNodeType {
  return node.type === "shape-node";
}

export function isFreehandNode(node: CustomNodeType): node is FreehandNodeType {
  return node.type === "freehand-node";
}

export function mergeNodeStyle(
  style: ShapeNodeType["data"]["style"],
  patch: Partial<NodeStyle>,
): NodeStyle {
  return {
    ...(style ?? DEFAULT_NODE_STYLE),
    ...patch,
  };
}
