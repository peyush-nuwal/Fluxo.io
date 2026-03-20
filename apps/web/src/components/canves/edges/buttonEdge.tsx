import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  getStraightPath,
  getSmoothStepPath,
  type Edge,
  type EdgeProps,
} from "@xyflow/react";
import { Plus } from "lucide-react";
import { useDiagramEditorStore } from "@/store/diagramEditorStore";

type ButtonEdgeData = {
  variant?: "straight" | "smoothstep" | "bezier";
  endType?: "none" | "arrow" | "arrowclosed";
  label?: string;
};

export type ButtonEdgeType = Edge<ButtonEdgeData>;

export default function ButtonEdge(props: EdgeProps<ButtonEdgeType>) {
  const {
    id,
    data,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    animated,
  } = props;

  const removeEdge = useDiagramEditorStore((s) => s.removeEdge);

  const variant = data?.variant ?? "straight";
  const label = data?.label?.trim() ?? "";
  const markerId = `${id}-marker-end`;
  const markerColor =
    typeof style.stroke === "string" ? style.stroke : "var(--foreground)";
  const edgeStrokeWidth =
    typeof style.strokeWidth === "number"
      ? style.strokeWidth
      : Number(style.strokeWidth) || 2;
  const markerStrokeWidth = Math.min(Math.max(edgeStrokeWidth * 0.8, 1.5), 3);
  const markerLength = Math.min(Math.max(12 + edgeStrokeWidth * 1.2, 12), 18);
  const markerHalfHeight = Math.round(markerLength * 0.45);
  const markerBackX = Math.round(markerLength * 0.75);
  const resolvedMarkerEnd =
    data?.endType === "none"
      ? undefined
      : data?.endType
        ? `url(#${markerId})`
        : markerEnd;

  const pathResult =
    variant === "straight"
      ? getStraightPath({ sourceX, sourceY, targetX, targetY })
      : variant === "smoothstep"
        ? getSmoothStepPath({
            sourceX,
            sourceY,
            sourcePosition,
            targetX,
            targetY,
            targetPosition,
          })
        : getBezierPath({
            sourceX,
            sourceY,
            sourcePosition,
            targetX,
            targetY,
            targetPosition,
          });

  const [edgePath, labelX, labelY] = pathResult;
  const movingToken =
    label.length > 4 ? label.slice(0, 4).toUpperCase() : label || ".";
  const movingTokenText = movingToken.slice(0, 4);
  const tokenPaddingX = 8;
  const tokenCharWidth = 8.5;
  const tokenHeight = 28;
  const tokenWidth = Math.max(
    30,
    Math.round(movingTokenText.length * tokenCharWidth + tokenPaddingX * 2),
  );
  const tokenX = -tokenWidth / 2;
  const tokenY = -tokenHeight / 2;

  return (
    <>
      {data?.endType && data.endType !== "none" && (
        <defs>
          <marker
            id={markerId}
            markerWidth={markerLength}
            markerHeight={markerHalfHeight * 2}
            viewBox={`0 ${-markerHalfHeight} ${markerLength} ${markerHalfHeight * 2}`}
            markerUnits="userSpaceOnUse"
            orient="auto"
            refX={markerLength - 1}
            refY="0"
          >
            {data.endType === "arrow" ? (
              <polyline
                fill="none"
                stroke={markerColor}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={markerStrokeWidth}
                points={`1,${-markerHalfHeight} ${markerBackX},0 1,${markerHalfHeight}`}
              />
            ) : (
              <polyline
                fill={markerColor}
                stroke={markerColor}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={markerStrokeWidth}
                points={`1,${-markerHalfHeight} ${markerBackX},0 1,${markerHalfHeight} 1,${-markerHalfHeight}`}
              />
            )}
          </marker>
        </defs>
      )}

      <BaseEdge path={edgePath} markerEnd={resolvedMarkerEnd} style={style} />

      {animated && (
        <g pointerEvents="none">
          <g>
            <rect
              x={tokenX}
              y={tokenY}
              width={tokenWidth}
              height={tokenHeight}
              rx="6"
              fill="var(--card)"
              fillOpacity={1}
              stroke="var(--border)"
              strokeWidth="1.25"
            />
            <text
              textAnchor="middle"
              dominantBaseline="central"
              fill="var(--foreground)"
              fontSize="12"
              fontWeight="700"
            >
              {movingTokenText}
            </text>
            <animateMotion
              dur="5.2s"
              repeatCount="indefinite"
              rotate="0"
              path={edgePath}
            />
          </g>
        </g>
      )}

      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 12,
          }}
          className="nodrag nopan relative pointer-events-none"
        >
          {!animated && data?.label ? (
            <div className="pointer-events-none absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-background/95 px-2 py-0.5 text-[10px] font-medium text-foreground shadow-sm">
              {data.label}
            </div>
          ) : null}
          <button
            className="pointer-events-auto flex size-5 cursor-pointer items-center justify-center rounded-lg border border-border border-solid bg-secondary text-secondary-foreground"
            onClick={() => removeEdge(id)}
          >
            <Plus className="size-2 rotate-45" />
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
