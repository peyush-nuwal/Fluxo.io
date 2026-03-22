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
  const resolvedStyle = {
    ...DEFAULT_NODE_STYLE,
    ...(nodeStyle ?? {}),
  };
  const base = "flex items-center justify-center pointer-events-none";
  const borderWidth = Number.isFinite(Number(resolvedStyle.borderWidth))
    ? Math.max(1, Number(resolvedStyle.borderWidth))
    : DEFAULT_NODE_STYLE.borderWidth;
  const borderRadius = Number.isFinite(Number(resolvedStyle.borderRadius))
    ? Math.max(0, Number(resolvedStyle.borderRadius))
    : DEFAULT_NODE_STYLE.borderRadius;

  const ring = selected && "ring-2 ring-primary/30";
  const commonStyle = {
    width,
    height,
    boxSizing: "content-box" as const,
    borderStyle: resolvedStyle.borderStyle,
    borderWidth,
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
      <div style={{ ...commonStyle, borderRadius }} className={cn(base, ring)}>
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
    return (
      <div
        style={{ width, height }}
        className={cn("relative pointer-events-none", ring)}
      >
        <div
          style={{
            ...commonStyle,
            width: Math.min(width, height),
            height: Math.min(width, height),
          }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45"
        />
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
