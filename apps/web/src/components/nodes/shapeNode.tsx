"use client";

import {
  Handle,
  NodeResizer,
  Position,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import { cn } from "@/lib/utils";
import { useDiagramEditorStore } from "@/store/diagramEditorStore";

export type ShapeKind = "text" | "rectangle" | "diamond" | "circle";

export const SHAPE_DEFAULT_SIZES: Record<
  ShapeKind,
  { width: number; height: number }
> = {
  text: { width: 180, height: 60 },
  rectangle: { width: 220, height: 104 },
  circle: { width: 160, height: 160 },
  diamond: { width: 180, height: 180 },
};

const SHAPE_MIN_SIZES: Record<ShapeKind, { width: number; height: number }> = {
  text: { width: 140, height: 48 },
  rectangle: { width: 160, height: 88 },
  circle: { width: 120, height: 120 },
  diamond: { width: 140, height: 140 },
};

export type ShapeNodeData = {
  label?: string;
  shape?: ShapeKind;
};

export type ShapeNodeType = Node<ShapeNodeData, "shape-node">;

function ShapeLabelInput({
  id,
  label,
  className,
}: {
  id: string;
  label?: string;
  className?: string;
}) {
  const updateNodeData = useDiagramEditorStore((state) => state.updateNodeData);

  return (
    <input
      type="text"
      value={label ?? ""}
      placeholder="Type here"
      onChange={(event) =>
        updateNodeData(id, {
          label: event.target.value,
        })
      }
      onMouseDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
      onDoubleClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
      className={cn(
        "nodrag nowheel w-full bg-transparent text-center outline-none placeholder:text-muted-foreground/70",
        className,
      )}
    />
  );
}

export default function ShapeNode({
  id,
  data,
  selected,
  width,
  height,
}: NodeProps<ShapeNodeType>) {
  const updateNodeSize = useDiagramEditorStore((state) => state.updateNodeSize);
  const shape = data.shape ?? "rectangle";
  const showHorizontalHandles = shape === "text";
  const defaultSize = SHAPE_DEFAULT_SIZES[shape];
  const minSize = SHAPE_MIN_SIZES[shape];
  const resolvedWidth = width ?? defaultSize.width;
  const resolvedHeight = height ?? defaultSize.height;

  return (
    <div className="relative">
      <NodeResizer
        isVisible={selected}
        minWidth={minSize.width}
        minHeight={minSize.height}
        handleClassName="!h-3 !w-3 !rounded-full !border-2 !border-background !bg-foreground"
        lineClassName="!border-primary/40"
        onResizeEnd={(_, params) =>
          updateNodeSize(id, params.width, params.height)
        }
      />

      <Handle
        type="target"
        position={showHorizontalHandles ? Position.Left : Position.Top}
      />

      {shape === "text" ? (
        <div
          className={cn(
            "flex items-center rounded-xl border border-dashed border-foreground/35 bg-background/90 px-3 py-2",
            selected && "bg-background/90 ring-2 ring-primary/20",
          )}
          style={{
            width: resolvedWidth,
            height: resolvedHeight,
          }}
        >
          <ShapeLabelInput
            id={id}
            label={data.label}
            className="text-base font-semibold"
          />
        </div>
      ) : null}

      {shape === "rectangle" ? (
        <div
          className={cn(
            "flex items-center justify-center rounded-2xl border border-foreground bg-background/95 px-4 py-4 shadow-sm",
            selected && "ring-2 ring-primary/25",
          )}
          style={{
            width: resolvedWidth,
            height: resolvedHeight,
          }}
        >
          <ShapeLabelInput
            id={id}
            label={data.label}
            className="text-sm font-medium"
          />
        </div>
      ) : null}

      {shape === "circle" ? (
        <div
          className={cn(
            "flex items-center justify-center rounded-full border border-foreground bg-background/95 p-5 shadow-sm",
            selected && "ring-2 ring-primary/25",
          )}
          style={{
            width: resolvedWidth,
            height: resolvedHeight,
          }}
        >
          <ShapeLabelInput
            id={id}
            label={data.label}
            className="text-sm font-medium"
          />
        </div>
      ) : null}

      {shape === "diamond" ? (
        <div
          className="flex items-center justify-center p-4"
          style={{
            width: resolvedWidth,
            height: resolvedHeight,
          }}
        >
          <div
            className={cn(
              "flex h-full w-full rotate-45 items-center justify-center border border-foreground bg-background/95 shadow-sm",
              selected && "ring-2 ring-primary/25",
            )}
          >
            <div className="w-full -rotate-45 px-2">
              <ShapeLabelInput
                id={id}
                label={data.label}
                className="text-sm font-medium"
              />
            </div>
          </div>
        </div>
      ) : null}

      <Handle
        type="source"
        position={showHorizontalHandles ? Position.Right : Position.Bottom}
      />
    </div>
  );
}
