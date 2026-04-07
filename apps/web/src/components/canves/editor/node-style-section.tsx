"use client";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { NodeStyle, ShapeNodeType } from "@/components/canves/nodes/types";
import { ColorOptionPicker } from "./color-option-picker";
import {
  RADIUS_OPTIONS,
  TEXT_SIZE_OPTIONS,
  THICKNESS_OPTIONS,
} from "./style-toolbar.shared";

type NodeStyleSectionProps = {
  selectedNode: ShapeNodeType | undefined;
  selectedNodeStyle: NodeStyle;
  isTextNode: boolean;
  onUpdateNodeStyle: (patch: Partial<NodeStyle>) => void;
};

export function NodeStyleSection({
  selectedNode,
  selectedNodeStyle,
  isTextNode,
  onUpdateNodeStyle,
}: NodeStyleSectionProps) {
  return (
    <>
      <div className="flex flex-col gap-2">
        <Label>Stroke</Label>
        <div className={cn(!selectedNode && "pointer-events-none opacity-60")}>
          <ColorOptionPicker
            value={selectedNodeStyle.borderColor}
            onChange={(color) => onUpdateNodeStyle({ borderColor: color })}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label>Background</Label>
        <div
          className={cn(
            (!selectedNode || isTextNode) && "pointer-events-none opacity-60",
          )}
        >
          <ColorOptionPicker
            value={selectedNodeStyle.backgroundColor}
            onChange={(color) => onUpdateNodeStyle({ backgroundColor: color })}
            includeTransparent
          />
        </div>
      </div>

      {selectedNode && !isTextNode && (
        <>
          <div className="flex flex-col gap-2">
            <Label>Border Style</Label>
            <div className="flex items-center gap-2">
              {(["solid", "dashed", "dotted"] as const).map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() =>
                    onUpdateNodeStyle({
                      borderStyle: style,
                    })
                  }
                  className={cn(
                    "flex h-9 w-12 items-center justify-center rounded-md border",
                    selectedNodeStyle.borderStyle === style
                      ? "border-primary bg-primary/10"
                      : "border-border",
                  )}
                >
                  <span
                    className="h-0 w-7 border-t-2 border-foreground"
                    style={{ borderTopStyle: style }}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Border Radius</Label>
            <div className="flex items-center gap-2">
              {RADIUS_OPTIONS.map((option) => {
                const active =
                  option.id === "pill"
                    ? selectedNodeStyle.borderRadius >= option.value
                    : selectedNodeStyle.borderRadius === option.value;

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() =>
                      onUpdateNodeStyle({
                        borderRadius: option.value,
                      })
                    }
                    className={cn(
                      "flex size-10 items-center justify-center rounded-md border",
                      active ? "border-primary bg-primary/10" : "border-border",
                    )}
                  >
                    <div
                      className={cn(
                        "h-5 w-5 border border-current",
                        option.id === "sharp" && "rounded-none",
                        option.id === "rounded" && "rounded-sm",
                        option.id === "pill" && "rounded-md",
                      )}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Thickness</Label>
            <div className="flex items-center gap-2">
              {THICKNESS_OPTIONS.map((option) => (
                <button
                  key={`node-thickness-${option.id}`}
                  type="button"
                  onClick={() =>
                    onUpdateNodeStyle({
                      borderWidth: option.value,
                    })
                  }
                  className={cn(
                    "flex h-9 w-12 items-center justify-center rounded-md border",
                    selectedNodeStyle.borderWidth === option.value
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
        </>
      )}

      {selectedNode && (
        <div className="flex flex-col gap-2">
          <Label>Text Size</Label>
          <div className="flex items-center gap-2">
            {TEXT_SIZE_OPTIONS.map((option) => (
              <button
                key={`text-size-${option.id}`}
                type="button"
                onClick={() =>
                  onUpdateNodeStyle({
                    fontSize: option.value,
                  })
                }
                className={cn(
                  "flex size-12 items-center justify-center rounded-md border text-xs font-medium",
                  (selectedNodeStyle.fontSize ?? 14) === option.value
                    ? "border-primary bg-primary/10"
                    : "border-border",
                )}
              >
                {option.id}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
