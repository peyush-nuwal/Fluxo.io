"use client";
import {
  NodeResizer,
  useUpdateNodeInternals,
  type NodeProps,
} from "@xyflow/react";
import { useEffect } from "react";
import { useDiagramEditorStore } from "@/store/diagramEditorStore";
import { DEFAULT_NODE_STYLE, type NodeStyle, ShapeNodeType } from "./types";
import { ShapeRenderer } from "./shapeRenderer";
import { ShapeHandles } from "./shapeHandles";
import { SHAPE_DEFAULT_SIZES } from "./nodes.config";
import { cn } from "@/lib/utils";

function getRgbFromColor(value: string) {
  const color = value.trim();

  if (/^#[0-9a-fA-F]{6}$/.test(color)) {
    return {
      r: Number.parseInt(color.slice(1, 3), 16),
      g: Number.parseInt(color.slice(3, 5), 16),
      b: Number.parseInt(color.slice(5, 7), 16),
    };
  }

  if (/^#[0-9a-fA-F]{3}$/.test(color)) {
    return {
      r: Number.parseInt(`${color[1]}${color[1]}`, 16),
      g: Number.parseInt(`${color[2]}${color[2]}`, 16),
      b: Number.parseInt(`${color[3]}${color[3]}`, 16),
    };
  }

  const rgbMatch = color.match(
    /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i,
  );

  if (rgbMatch) {
    return {
      r: Number.parseInt(rgbMatch[1], 10),
      g: Number.parseInt(rgbMatch[2], 10),
      b: Number.parseInt(rgbMatch[3], 10),
    };
  }

  return null;
}

function getReadableTextColor(backgroundColor: string, fallback: string) {
  if (backgroundColor === "transparent" || backgroundColor.includes("var(")) {
    return fallback;
  }

  const rgb = getRgbFromColor(backgroundColor);
  if (!rgb) return fallback;

  const luminance = (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255;
  return luminance < 0.55 ? "#ffffff" : "#111827";
}

function toPositiveNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return null;
}

export default function ShapeNode({
  id,
  data,
  selected,
  width,
  height,
  ...rest
}: NodeProps<ShapeNodeType>) {
  const updateNodeSize = useDiagramEditorStore((s) => s.updateNodeSize);
  const updateNodeInternals = useUpdateNodeInternals();
  const style = (rest as { style?: ShapeNodeType["style"] }).style;

  const shape = data.shape ?? "rectangle";
  const nodeStyle: NodeStyle = {
    ...DEFAULT_NODE_STYLE,
    ...(data.style ?? {}),
  };
  const labelColor =
    shape === "text"
      ? nodeStyle.borderColor
      : getReadableTextColor(nodeStyle.backgroundColor, nodeStyle.borderColor);

  const fallbackSize = SHAPE_DEFAULT_SIZES[shape];
  const styleWidth = toPositiveNumber(style?.width);
  const styleHeight = toPositiveNumber(style?.height);
  const measuredWidth = toPositiveNumber(width);
  const measuredHeight = toPositiveNumber(height);
  const minMeasuredWidth = shape === "line" ? 1 : 24;
  const minMeasuredHeight = shape === "line" ? 1 : 24;

  const w =
    styleWidth ??
    (measuredWidth !== null && measuredWidth >= minMeasuredWidth
      ? measuredWidth
      : null) ??
    fallbackSize.width;
  const h =
    styleHeight ??
    (measuredHeight !== null && measuredHeight >= minMeasuredHeight
      ? measuredHeight
      : null) ??
    fallbackSize.height;
  const offsetResizeOverlay = shape === "rectangle" || shape === "circle";

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      updateNodeInternals(id);
    });

    return () => cancelAnimationFrame(frame);
  }, [
    id,
    shape,
    w,
    h,
    nodeStyle.borderWidth,
    nodeStyle.borderRadius,
    nodeStyle.borderStyle,
    updateNodeInternals,
  ]);

  return (
    <div className="relative" style={{ width: w, height: h }}>
      {/* Handles ABOVE */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <ShapeHandles shape={shape} />
      </div>
      {/* Shape UI */}
      <ShapeRenderer
        shape={shape}
        width={w}
        height={h}
        selected={selected}
        nodeStyle={nodeStyle}
      >
        <ShapeLabelInput
          id={id}
          label={data.label}
          shape={shape}
          labelColor={labelColor}
          fontSize={nodeStyle.fontSize}
          className="text-sm font-medium"
        />
      </ShapeRenderer>

      {/* Resize */}
      <NodeResizer
        isVisible={selected}
        minWidth={40}
        minHeight={24}
        lineClassName={cn(
          "fluxo-node-resizer-line",
          offsetResizeOverlay && "fluxo-node-resizer-line--outer",
        )}
        handleClassName={cn(
          "fluxo-node-resizer-handle",
          offsetResizeOverlay && "fluxo-node-resizer-handle--outer",
        )}
        onResizeEnd={(_, params) => {
          updateNodeSize(id, params.width, params.height);
          updateNodeInternals(id);
        }}
      />
    </div>
  );
}

function ShapeLabelInput({
  id,
  label,
  shape,
  labelColor,
  fontSize,
  className,
}: {
  id: string;
  label?: string;
  shape: ShapeNodeType["data"]["shape"];
  labelColor: string;
  fontSize?: number;
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
      style={{ color: labelColor, fontSize: fontSize ?? 14 }}
      className={cn(
        "nodrag nowheel w-full bg-transparent text-center outline-none placeholder:text-muted-foreground/70 px-1",
        shape === "text" ? "text-left" : "",
        className,
      )}
    />
  );
}
