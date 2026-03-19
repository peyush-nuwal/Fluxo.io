import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  getStraightPath,
  getSmoothStepPath,
  type EdgeProps,
  type Edge,
} from "@xyflow/react";
import { Plus } from "lucide-react";
import { useDiagramEditorStore } from "@/store/diagramEditorStore";

type ButtonEdgeData = {
  variant?: "straight" | "smoothstep" | "bezier";
  endType?: "none" | "arrow" | "arrowclosed";
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
  } = props;

  const removeEdge = useDiagramEditorStore((s) => s.removeEdge);

  const variant = data?.variant ?? "straight";
  const markerId = `${id}-marker-end`;
  const markerColor =
    typeof style.stroke === "string" ? style.stroke : "hsl(var(--foreground))";
  const markerStrokeWidth =
    typeof style.strokeWidth === "number"
      ? style.strokeWidth
      : Number(style.strokeWidth) || 2;
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

  return (
    <>
      {data?.endType && data.endType !== "none" && (
        <defs>
          <marker
            id={markerId}
            markerWidth="36"
            markerHeight="36"
            viewBox="-30 -30 60 60"
            markerUnits="strokeWidth"
            orient="auto"
            refX="0"
            refY="0"
          >
            {data.endType === "arrow" ? (
              <polyline
                fill="none"
                stroke={markerColor}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={markerStrokeWidth}
                points="-20,-16 0,0 -20,16"
              />
            ) : (
              <polyline
                fill={markerColor}
                stroke={markerColor}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={markerStrokeWidth}
                points="-20,-16 0,0 -20,16 -20,-16"
              />
            )}
          </marker>
        </defs>
      )}

      <BaseEdge path={edgePath} markerEnd={resolvedMarkerEnd} style={style} />

      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 12,
          }}
          className="nodrag nopan pointer-events-auto"
        >
          <button
            className="size-5  flex items-center justify-center bg-secondary text-secondary-foreground cursor-pointer border border-border border-solid rounded-lg"
            onClick={() => removeEdge(id)}
          >
            <Plus className="rotate-45 size-2 " />
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
