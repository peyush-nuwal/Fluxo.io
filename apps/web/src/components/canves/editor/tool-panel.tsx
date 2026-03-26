"use client";

import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
  type ComponentType,
} from "react";
import {
  ArrowRight,
  Circle,
  Diamond,
  Download,
  Eraser,
  Hand,
  MousePointer2,
  Pencil,
  Share2,
  Square,
  Type,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDiagramEditorStore } from "@/store/diagramEditorStore";
import { TOOL_ITEMS, type DiagramToolId } from "./tools";
import { Separator } from "@/components/ui/separator";
import CustomTooltip from "@/components/custom-tooltip";
import { toJpeg, toPng, toSvg } from "html-to-image";
import { getNodesBounds, getViewportForBounds } from "@xyflow/react";
import DownloadDiagramForm from "@/components/download-diagram-form";
import { toast } from "sonner";
import { useDiagramStore } from "@/store/diagramsStore";
import { useModalStore } from "@/store/useModalStore";
import CollabForm from "@/components/collab-form";

type ToolPanelProps = {
  diagramId: string;
  setOpen: Dispatch<SetStateAction<boolean>>;
};

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

function triggerDownload(dataUrl: string, fileName: string, extension: string) {
  const anchor = document.createElement("a");
  anchor.setAttribute("download", `${fileName}.${extension}`);
  anchor.setAttribute("href", dataUrl);
  anchor.click();
}

export default function ToolPanel({ diagramId, setOpen }: ToolPanelProps) {
  const activeTool = useDiagramEditorStore((state) => state.activeTool);
  const setActiveTool = useDiagramEditorStore((state) => state.setActiveTool);
  const nodes = useDiagramEditorStore((state) => state.nodes);
  const { verifyDiagramOwnership } = useDiagramStore();
  const [isDownloadOpen, setIsDownloadOpen] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

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

  const handleDownload = useCallback(
    async (metaData: {
      fileType: "svg" | "png" | "jpeg";
      resolution: 1 | 2 | 3;
      fileName: string;
      background: "transparent" | "canvas";
    }) => {
      const viewportEl = document.querySelector(
        ".react-flow__viewport",
      ) as HTMLElement | null;
      if (!viewportEl) {
        toast.error("Could not find diagram viewport for export.");
        return;
      }

      if (!nodes.length) {
        toast.error("Add at least one node before downloading.");
        return;
      }

      const nodesBounds = getNodesBounds(nodes);
      const padding = 80;
      const exportWidth = Math.max(
        Math.ceil(nodesBounds.width + padding * 2),
        256,
      );
      const exportHeight = Math.max(
        Math.ceil(nodesBounds.height + padding * 2),
        256,
      );

      const viewport = getViewportForBounds(
        nodesBounds,
        exportWidth,
        exportHeight,
        0.1,
        2,
        0.5,
      );

      const backgroundColor =
        metaData.background === "transparent"
          ? "transparent"
          : "var(--background)";

      try {
        setIsDownloading(true);

        const baseOptions = {
          backgroundColor,
          width: exportWidth,
          height: exportHeight,
          pixelRatio: metaData.resolution,
          style: {
            width: `${exportWidth}px`,
            height: `${exportHeight}px`,
            transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
            transformOrigin: "top left" as const,
          },
        };

        if (metaData.fileType === "svg") {
          const dataUrl = await toSvg(viewportEl, baseOptions);
          triggerDownload(dataUrl, metaData.fileName, "svg");
        } else if (metaData.fileType === "jpeg") {
          const dataUrl = await toJpeg(viewportEl, {
            ...baseOptions,
            quality: 0.95,
          });
          triggerDownload(dataUrl, metaData.fileName, "jpeg");
        } else {
          const dataUrl = await toPng(viewportEl, baseOptions);
          triggerDownload(dataUrl, metaData.fileName, "png");
        }

        toast.success("Diagram downloaded successfully.");
        setIsDownloadOpen(false);
      } catch (_error) {
        toast.error("Failed to download diagram.");
      } finally {
        setIsDownloading(false);
      }
    },
    [nodes],
  );

  const onClickOpenCollabForm = () => {
    console.log("clicket");
    setOpen(true);
  };

  return (
    <aside className="flex h-18 w-fit items-center justify-center gap-2 rounded-2xl border border-border/70 bg-background/95 px-6 py-2 shadow-lg backdrop-blur">
      {TOOL_ITEMS.map((tool) => {
        const Icon = TOOL_ICONS[tool.id];
        const isActive = activeTool === tool.id;

        return (
          <CustomTooltip key={tool.id} content={tool.label}>
            <Button
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
          onClick={onClickOpenCollabForm}
          variant="ghost"
          className="relative bg-none! h-14 w-14 rounded-xl hover:bg-primary hover:text-primary-foreground transition-colors ease-in-out duration-200"
        >
          <Share2 className="size-5" />
        </Button>
      </CustomTooltip>

      <CustomTooltip content="Download">
        <Button
          variant="ghost"
          className="relative bg-none! h-14 w-14 rounded-xl hover:bg-primary hover:text-primary-foreground transition-colors ease-in-out duration-200"
          onClick={() => setIsDownloadOpen(true)}
        >
          <Download className="size-5" />
        </Button>
      </CustomTooltip>

      <DownloadDiagramForm
        isOpen={isDownloadOpen}
        close={() => {
          if (isDownloading) return;
          setIsDownloadOpen(false);
        }}
        onDownload={handleDownload}
        isDownloading={isDownloading}
      />
    </aside>
  );
}
