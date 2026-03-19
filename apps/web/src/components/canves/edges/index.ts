import type { BuiltInEdge, Edge, EdgeTypes } from "@xyflow/react";
import ButtonEdge, { type ButtonEdgeType } from "./buttonEdge";

import type { LucideIcon } from "lucide-react";
import { MoveUpRight, CornerUpRight, Redo } from "lucide-react";

/* ---------------- EDGE VARIANT TYPE ---------------- */

export type EdgeVariantType = "straight" | "bezier" | "smoothstep";
export type EdgeEndType = "none" | "arrow" | "arrowclosed";

/* ---------------- EDGE VARIANT OPTIONS ---------------- */

export type EdgeVariantOption = {
  id: EdgeVariantType;
  icon: LucideIcon;
};

export const edgeVariants: EdgeVariantOption[] = [
  { id: "straight", icon: MoveUpRight },
  { id: "bezier", icon: Redo },
  { id: "smoothstep", icon: CornerUpRight },
];

/* ---------------- INITIAL EDGES ---------------- */

export const initialEdges = [
  { id: "a->c", source: "a", target: "c", animated: true },
  { id: "b->d", source: "b", target: "d", type: "button-edge" },
  { id: "c->d", source: "c", target: "d", animated: true },
] satisfies Edge[];

/* ---------------- EDGE TYPES ---------------- */

export const edgeTypes = {
  "button-edge": ButtonEdge,
} satisfies EdgeTypes;

/* ---------------- CUSTOM EDGE TYPE ---------------- */

export type CustomEdgeType = BuiltInEdge | ButtonEdgeType;
