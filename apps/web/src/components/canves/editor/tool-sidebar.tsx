"use client";

import { useEffect, type ComponentType } from "react";
import {
  ArrowRight,
  Circle,
  Diamond,
  Eraser,
  Hand,
  Minus,
  MousePointer2,
  Square,
  Type,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDiagramEditorStore } from "@/store/diagramEditorStore";
import { TOOL_ITEMS, type DiagramToolId } from "./tools";

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
  line: Minus,
  eraser: Eraser,
};

export default function ToolSidebar() {
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
    <aside className="flex w-18 flex-col gap-2 rounded-2xl border border-border/70 bg-background/95 p-2 shadow-lg backdrop-blur">
      {TOOL_ITEMS.map((tool) => {
        const Icon = TOOL_ICONS[tool.id];
        const isActive = activeTool === tool.id;

        return (
          <Button
            key={tool.id}
            type="button"
            variant={isActive ? "default" : "ghost"}
            size="icon"
            className={cn("h-12 w-12 rounded-xl", isActive && "shadow-sm")}
            onClick={() => setActiveTool(tool.id)}
            title={tool.label}
            aria-pressed={isActive}
          >
            <Icon className="size-5" />
            <span className="sr-only">{tool.label}</span>
          </Button>
        );
      })}
    </aside>
  );
}
