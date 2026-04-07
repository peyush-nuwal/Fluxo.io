import type { BuiltInNode, NodeTypes } from "@xyflow/react";
import PositionLoggerNode, {
  type PositionLoggerNodeType,
} from "./positionLoggerNode";
import FreehandNode, { type FreehandNodeType } from "./freehandNode";
import ShapeNode from "./shapeNode";
import { ShapeNodeType } from "./types";

export const nodeTypes = {
  "shape-node": ShapeNode,
  "freehand-node": FreehandNode,
  "position-logger": PositionLoggerNode,
} satisfies NodeTypes;

export type CustomNodeType =
  | BuiltInNode
  | PositionLoggerNodeType
  | FreehandNodeType
  | ShapeNodeType;
