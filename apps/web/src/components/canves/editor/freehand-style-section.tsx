"use client";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { FreehandNodeType } from "@/components/canves/nodes/freehandNode";
import { ColorOptionPicker } from "./color-option-picker";
import { THICKNESS_OPTIONS } from "./style-toolbar.shared";

type FreehandStyleSectionProps = {
  selectedNode: FreehandNodeType;
  onUpdateStroke: (stroke: string) => void;
  onUpdateStrokeWidth: (strokeWidth: number) => void;
};

export function FreehandStyleSection({
  selectedNode,
  onUpdateStroke,
  onUpdateStrokeWidth,
}: FreehandStyleSectionProps) {
  const stroke = selectedNode.data?.stroke ?? "#111827";
  const strokeWidth = Number(selectedNode.data?.strokeWidth ?? 2);

  return (
    <>
      <div className="flex flex-col gap-2">
        <Label>Freehand Color</Label>
        <ColorOptionPicker value={stroke} onChange={onUpdateStroke} />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Freehand Stroke</Label>
        <div className="flex items-center gap-2">
          {THICKNESS_OPTIONS.map((option) => (
            <button
              key={`freehand-thickness-${option.id}`}
              type="button"
              onClick={() => onUpdateStrokeWidth(option.value)}
              className={cn(
                "flex h-9 w-12 items-center justify-center rounded-md border",
                strokeWidth === option.value
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
  );
}
