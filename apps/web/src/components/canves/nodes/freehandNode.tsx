"use client";
import type { Node, NodeProps, XYPosition } from "@xyflow/react";
export type FreehandNodeData = {
  points: XYPosition[];
  strokeWidth?: number;
  stroke?: string;
};

export type FreehandNodeType = Node<FreehandNodeData, "freehand-node">;

function buildPath(points: XYPosition[]) {
  if (!points.length) return "";

  return points.reduce((acc, point, index) => {
    if (index === 0) {
      return `M ${point.x} ${point.y}`;
    }

    return `${acc} L ${point.x} ${point.y}`;
  }, "");
}

export default function FreehandNode({
  data,
  selected,
  width,
  height,
}: NodeProps<FreehandNodeType>) {
  const w = Math.max(width ?? 1, 1);
  const h = Math.max(height ?? 1, 1);
  const stroke = data.stroke ?? "currentColor";
  const strokeWidth = data.strokeWidth ?? 2;
  const path = buildPath(data.points ?? []);

  return (
    <div
      style={{ width: w, height: h }}
      className="relative pointer-events-none"
    >
      <svg width={w} height={h} className="overflow-visible">
        <path
          d={path}
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {selected && (
        <div className="absolute inset-0 rounded-sm ring-1 ring-primary/40" />
      )}
    </div>
  );
}
