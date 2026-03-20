"use client";

import { type CSSProperties } from "react";
import { Activity, ArrowRight, Minus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  edgeVariants,
  type CustomEdgeType,
  type EdgeEndType,
  type EdgeVariantType,
} from "@/components/canves/edges";
import { ColorOptionPicker } from "./color-option-picker";
import {
  EDGE_END_OPTIONS,
  THICKNESS_OPTIONS,
  normalizeHex,
} from "./style-toolbar.shared";

type EdgeStyleSectionProps = {
  selectedEdge: CustomEdgeType | undefined;
  selectedEdgeId: string | null;
  selectedEdgeVariant: EdgeVariantType;
  selectedEdgeEndType: EdgeEndType;
  onUpdateEdgeType: (variant: EdgeVariantType) => void;
  onUpdateSelectedEdgeVariant: (variant: EdgeVariantType) => void;
  onUpdateEdgeEndType: (endType: EdgeEndType) => void;
  onUpdateSelectedEdgeEndType: (endType: EdgeEndType) => void;
  onUpdateSelectedEdgeStyle: (patch: CSSProperties) => void;
  onUpdateSelectedEdgeAnimation: (isAnimated: boolean) => void;
  onUpdateSelectedEdgeData: (patch: Record<string, unknown>) => void;
};

export function EdgeStyleSection({
  selectedEdge,
  selectedEdgeId,
  selectedEdgeVariant,
  selectedEdgeEndType,
  onUpdateEdgeType,
  onUpdateSelectedEdgeVariant,
  onUpdateEdgeEndType,
  onUpdateSelectedEdgeEndType,
  onUpdateSelectedEdgeStyle,
  onUpdateSelectedEdgeAnimation,
  onUpdateSelectedEdgeData,
}: EdgeStyleSectionProps) {
  const selectedEdgeData = (selectedEdge?.data ?? {}) as {
    label?: string;
  };

  return (
    <>
      <div className="flex flex-col gap-2">
        <Label>Edge Type</Label>
        <div className="flex items-center gap-2">
          {edgeVariants.map((edge) => (
            <button
              key={edge.id}
              type="button"
              onClick={() => {
                onUpdateEdgeType(edge.id);
                if (selectedEdgeId) {
                  onUpdateSelectedEdgeVariant(edge.id);
                }
              }}
              className={cn(
                "flex size-10 items-center justify-center rounded-md border",
                selectedEdgeVariant === edge.id
                  ? "border-primary bg-primary/10"
                  : "border-border",
              )}
            >
              <edge.icon className="size-4" />
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label>Edge End</Label>
        <div className="flex items-center gap-2">
          {EDGE_END_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                onUpdateEdgeEndType(option.id);
                if (selectedEdgeId) {
                  onUpdateSelectedEdgeEndType(option.id);
                }
              }}
              className={cn(
                "flex size-10 items-center justify-center rounded-md border",
                selectedEdgeEndType === option.id
                  ? "border-primary bg-primary/10"
                  : "border-border",
              )}
            >
              {option.icon === "none" ? (
                <Minus className="size-4" />
              ) : option.icon === "arrow" ? (
                <ArrowRight className="size-4" />
              ) : (
                <span className="inline-block h-0 w-0 border-y-4 border-y-transparent border-l-[7px] border-l-foreground" />
              )}
            </button>
          ))}
        </div>
      </div>

      {selectedEdge && (
        <>
          <div className="flex flex-col gap-2">
            <Label>Edge Color</Label>
            <ColorOptionPicker
              value={
                normalizeHex(String(selectedEdge.style?.stroke ?? "")) ??
                "#111827"
              }
              onChange={(color) => onUpdateSelectedEdgeStyle({ stroke: color })}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Thickness</Label>
            <div className="flex items-center gap-2">
              {THICKNESS_OPTIONS.map((option) => (
                <button
                  key={`edge-thickness-${option.id}`}
                  type="button"
                  onClick={() =>
                    onUpdateSelectedEdgeStyle({
                      strokeWidth: option.value,
                    })
                  }
                  className={cn(
                    "flex h-9 w-12 items-center justify-center rounded-md border",
                    Number(selectedEdge.style?.strokeWidth ?? 1) ===
                      option.value
                      ? "border-primary bg-primary/10"
                      : "border-border",
                  )}
                >
                  <span
                    className="h-0 w-7 border-t border-foreground"
                    style={{ borderTopWidth: option.value }}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Animation</Label>

            <div className="flex items-center gap-2">
              {/* Static */}
              <button
                type="button"
                onClick={() => onUpdateSelectedEdgeAnimation(false)}
                className={cn(
                  "flex size-10 items-center justify-center rounded-md border",
                  !selectedEdge?.animated
                    ? "border-primary bg-primary/10"
                    : "border-border",
                )}
              >
                <Minus className="size-4" />
              </button>

              {/* Animated */}
              <button
                type="button"
                onClick={() => onUpdateSelectedEdgeAnimation(true)}
                className={cn(
                  "flex size-10 items-center justify-center rounded-md border",
                  selectedEdge?.animated
                    ? "border-primary bg-primary/10"
                    : "border-border",
                )}
              >
                <Activity className="size-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Moving Text</Label>
            <input
              type="text"
              value={selectedEdgeData.label ?? ""}
              onChange={(event) =>
                onUpdateSelectedEdgeData({ label: event.target.value })
              }
              placeholder="e.g. API"
              className="h-9 rounded-md border border-border bg-background px-2 text-sm outline-none"
            />
          </div>
        </>
      )}
    </>
  );
}
