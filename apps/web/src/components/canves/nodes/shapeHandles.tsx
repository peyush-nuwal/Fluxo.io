import { Handle, Position } from "@xyflow/react";
import type { ShapeKind } from "./types";

type HandleConfig = {
  source?: Position[];
  target?: Position[];
};

const DEFAULT_HANDLES: HandleConfig = {
  source: [Position.Top, Position.Right, Position.Bottom, Position.Left],
  target: [Position.Top, Position.Right, Position.Bottom, Position.Left],
};

const SHAPE_HANDLES: Partial<Record<ShapeKind, HandleConfig>> = {
  text: {
    source: [Position.Right],
    target: [Position.Left],
  },
  rectangle: DEFAULT_HANDLES,
  circle: DEFAULT_HANDLES,
  diamond: DEFAULT_HANDLES,
  line: {
    source: [Position.Right],
    target: [Position.Left],
  },
};

const getPositionId = (pos: Position) => {
  switch (pos) {
    case Position.Top:
      return "top";
    case Position.Right:
      return "right";
    case Position.Bottom:
      return "bottom";
    case Position.Left:
      return "left";
  }
};

const getHandleId = (type: "source" | "target", pos: Position) =>
  `${type}-${getPositionId(pos)}`;

const getStyle = (pos: Position) => {
  switch (pos) {
    case Position.Top:
      return { top: 0, left: "50%", transform: "translate(-50%, -50%)" };
    case Position.Bottom:
      return { bottom: 0, left: "50%", transform: "translate(-50%, 50%)" };
    case Position.Left:
      return { left: 0, top: "50%", transform: "translate(-50%, -50%)" };
    case Position.Right:
      return { right: 0, top: "50%", transform: "translate(50%, -50%)" };
  }
};

export function ShapeHandles({ shape }: { shape: ShapeKind }) {
  const handles = SHAPE_HANDLES[shape] ?? DEFAULT_HANDLES;

  return (
    <>
      {handles.target?.map((pos) => (
        <Handle
          key={`target-${shape}-${pos}`}
          id={getHandleId("target", pos)}
          type="target"
          position={pos}
          style={{
            ...getStyle(pos),
            position: "absolute",
            width: 10,
            height: 10,
            background: "var(--background)",
            border: "1px solid var(--foreground)",
          }}
          className="pointer-events-auto"
        />
      ))}

      {handles.source?.map((pos) => (
        <Handle
          key={`source-${shape}-${pos}`}
          id={getHandleId("source", pos)}
          type="source"
          position={pos}
          style={{
            ...getStyle(pos),
            position: "absolute",
            width: 10,
            height: 10,
            background: "var(--foreground)",
            border: "1px solid var(--background)",
          }}
          className="pointer-events-auto"
        />
      ))}
    </>
  );
}
