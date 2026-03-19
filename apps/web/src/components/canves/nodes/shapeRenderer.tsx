import { cn } from "@/lib/utils";
import { DEFAULT_NODE_STYLE, type NodeStyle, ShapeKind } from "./types";

type Props = {
  shape: ShapeKind;
  width: number;
  height: number;
  selected: boolean;
  nodeStyle?: NodeStyle;
  children?: React.ReactNode;
};

export function ShapeRenderer({
  shape,
  width,
  height,
  selected,
  nodeStyle,
  children,
}: Props) {
  const resolvedStyle = nodeStyle ?? DEFAULT_NODE_STYLE;
  const base = "flex items-center justify-center pointer-events-none";

  const ring = selected && "ring-2 ring-primary/30";
  const commonStyle = {
    width,
    height,
    borderStyle: resolvedStyle.borderStyle,
    borderWidth: resolvedStyle.borderWidth,
    borderColor: resolvedStyle.borderColor,
    backgroundColor: resolvedStyle.backgroundColor,
  } as const;

  if (shape === "text") {
    return (
      <div
        style={{ width, height, color: resolvedStyle.borderColor }}
        className={cn(
          "flex items-center justify-center bg-transparent pointer-events-none",
          ring,
        )}
      >
        <div className="pointer-events-auto w-full">{children}</div>
      </div>
    );
  }

  if (shape === "rectangle") {
    return (
      <div
        style={{ ...commonStyle, borderRadius: resolvedStyle.borderRadius }}
        className={cn(base, ring)}
      >
        <div className="pointer-events-auto">{children}</div>
      </div>
    );
  }

  if (shape === "circle") {
    return (
      <div style={commonStyle} className={cn(base, "rounded-full", ring)}>
        <div className="pointer-events-auto">{children}</div>
      </div>
    );
  }

  if (shape === "diamond") {
    const dashArray =
      resolvedStyle.borderStyle === "dashed"
        ? `${resolvedStyle.borderWidth * 4} ${resolvedStyle.borderWidth * 2}`
        : resolvedStyle.borderStyle === "dotted"
          ? `1 ${resolvedStyle.borderWidth * 2.5}`
          : undefined;

    return (
      <div
        style={{ width, height }}
        className={cn("relative pointer-events-none", ring)}
      >
        <svg
          width={width}
          height={height}
          className="absolute inset-0 overflow-visible"
        >
          <polygon
            points={`${width / 2},${resolvedStyle.borderWidth / 2} ${width - resolvedStyle.borderWidth / 2},${height / 2} ${width / 2},${height - resolvedStyle.borderWidth / 2} ${resolvedStyle.borderWidth / 2},${height / 2}`}
            fill={resolvedStyle.backgroundColor}
            stroke={resolvedStyle.borderColor}
            strokeWidth={resolvedStyle.borderWidth}
            strokeDasharray={dashArray}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
          <div>{children}</div>
        </div>
      </div>
    );
  }

  if (shape === "line") {
    return (
      <div style={{ width, height }} className="relative pointer-events-none">
        <div
          className={cn(
            "absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 bg-foreground",
            ring,
          )}
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-auto"></div>
      </div>
    );
  }

  return (
    <div
      style={{ width, height }}
      className={cn(
        "flex items-center justify-center pointer-events-none",
        ring,
      )}
    >
      <div className="pointer-events-auto w-full">{children}</div>
    </div>
  );
}
