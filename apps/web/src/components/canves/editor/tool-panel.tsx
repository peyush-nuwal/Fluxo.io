"use client";

import { useEffect, type ComponentType } from "react";
import {
  ArrowRight,
  Circle,
  Diamond,
  Eraser,
  Hand,
  MousePointer2,
  Pencil,
  Share2,
  Square,
  Type,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDiagramEditorStore } from "@/store/diagramEditorStore";
import { TOOL_ITEMS, type DiagramToolId } from "./tools";
import { Separator } from "@/components/ui/separator";
import CustomTooltip from "@/components/custom-tooltip";

const TOOL_ICONS: Record<
  DiagramToolId,
  ComponentType<{ className?: string }>
> = {
  select: MousePointer2,
  hand: Hand,
  text: Type,
  rectangle: Square,
  diamond: Diamond,
  circle: Circle,
  arrow: ArrowRight,
  eraser: Eraser,
  pencil: Pencil,
};

export default function ToolPanel() {
  const activeTool = useDiagramEditorStore((state) => state.activeTool);
  const setActiveTool = useDiagramEditorStore((state) => state.setActiveTool);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const keyMap = Object.fromEntries(
        TOOL_ITEMS.map((tool) => [tool.key, tool.id]),
      );

      const tool = keyMap[event.key];
      if (tool) setActiveTool(tool);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [setActiveTool]);

  return (
    <aside className="flex h-18 w-fit items-center justify-center gap-2 rounded-2xl border border-border/70 bg-background/95 px-6 py-2 shadow-lg backdrop-blur">
      {TOOL_ITEMS.map((tool) => {
        const Icon = TOOL_ICONS[tool.id];
        const isActive = activeTool === tool.id;

        return (
          <CustomTooltip content={tool.label}>
            <Button
              key={tool.id}
              type="button"
              variant={isActive ? "default" : "ghost"}
              size="icon"
              className={cn(
                "relative h-14 w-14 rounded-xl",
                isActive && "shadow-sm",
              )}
              onClick={() => setActiveTool(tool.id)}
            >
              <Icon className="size-5" />
              <span className="sr-only">{tool.label}</span>
              <div
                className={cn(
                  "absolute bottom-1 right-2 text-xs",
                  isActive ? "text-black" : " text-muted-foreground",
                )}
              >
                {tool.key}
              </div>
            </Button>
          </CustomTooltip>
        );
      })}
      <Separator orientation="vertical" />
      <CustomTooltip content="Share">
        <Button
          variant={"ghost"}
          className="relative bg-none! h-14 w-14 rounded-xl hover:bg-primary hover:text-primary-foreground transition-colors ease-in-out duration-200"
        >
          <Share2 className="size-5" />
        </Button>
      </CustomTooltip>

      <CustomTooltip content="Download">
        <Button
          variant={"ghost"}
          className="relative bg-none! h-14 w-14 rounded-xl hover:bg-primary hover:text-primary-foreground transition-colors ease-in-out duration-200"
        >
          <Download className="size-5" />
        </Button>
      </CustomTooltip>
    </aside>
  );
}
