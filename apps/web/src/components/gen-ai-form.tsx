import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Dispatch, SetStateAction, useState } from "react";
import { generateDiagramFromPrompt } from "@/lib/ai/client";
import { toast } from "sonner";
import DiagramLoader from "./ui/diagram-loader";
import { useDiagramEditorStore } from "@/store/diagramEditorStore";
import { CustomEdgeType } from "./canves/edges";
import { CustomNodeType } from "./canves/nodes";

type GenAiFormProp = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
};

type NodeBounds = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
};

function toPositiveNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return null;
}

function getNodeSize(node: CustomNodeType) {
  const style = node.style as Record<string, unknown> | undefined;
  const width =
    toPositiveNumber(style?.width) ?? toPositiveNumber(node.width) ?? 200;
  const height =
    toPositiveNumber(style?.height) ?? toPositiveNumber(node.height) ?? 80;
  return { width, height };
}

function getNodesBounds(nodes: CustomNodeType[]): NodeBounds | null {
  if (nodes.length === 0) return null;

  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  for (const node of nodes) {
    const { width, height } = getNodeSize(node);
    const x = node.position?.x ?? 0;
    const y = node.position?.y ?? 0;

    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + width);
    maxY = Math.max(maxY, y + height);
  }

  return { minX, minY, maxX, maxY };
}

function getUniqueId(
  desiredId: string | undefined,
  usedIds: Set<string>,
  prefix: string,
) {
  const base = desiredId?.trim() || `${prefix}-${crypto.randomUUID()}`;
  if (!usedIds.has(base)) {
    usedIds.add(base);
    return base;
  }

  let counter = 1;
  let candidate = `${base}-${counter}`;
  while (usedIds.has(candidate)) {
    counter += 1;
    candidate = `${base}-${counter}`;
  }
  usedIds.add(candidate);
  return candidate;
}

const GenAiForm = ({ open, setOpen }: GenAiFormProp) => {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsloading] = useState<boolean>(false);
  const nodes = useDiagramEditorStore((s) => s.nodes);
  const existingEdges = useDiagramEditorStore((s) => s.edges);
  const applyChanges = useDiagramEditorStore((s) => s.applyChanges);

  const handleSubmit = async () => {
    if (!prompt.trim()) return;
    setIsloading(true);
    try {
      const res = await generateDiagramFromPrompt(prompt);

      if (!res.success) {
        toast.error(res.message);
        return;
      }

      const aiNodes = res.data.nodes as CustomNodeType[];
      const aiEdges = res.data.edges as CustomEdgeType[];

      const usedNodeIds = new Set(nodes.map((node) => node.id));
      const usedEdgeIds = new Set(existingEdges.map((edge) => edge.id));

      const existingBounds = getNodesBounds(nodes);
      const generatedBounds = getNodesBounds(aiNodes);

      const sideGap = 180;
      const offsetX =
        existingBounds && generatedBounds
          ? existingBounds.maxX - generatedBounds.minX + sideGap
          : 0;
      const offsetY =
        existingBounds && generatedBounds
          ? existingBounds.minY - generatedBounds.minY
          : 0;

      const nodeIdMap = new Map<string, string>();
      const mappedNodes = aiNodes.map((node) => {
        const nextId = getUniqueId(node.id, usedNodeIds, "ai-node");
        nodeIdMap.set(node.id, nextId);

        return {
          ...node,
          id: nextId,
          selected: false,
          position: {
            x: (node.position?.x ?? 0) + offsetX,
            y: (node.position?.y ?? 0) + offsetY,
          },
        } as CustomNodeType;
      });

      const mappedEdges = aiEdges
        .map((edge) => {
          const remappedSource = edge.source
            ? nodeIdMap.get(edge.source)
            : undefined;
          const remappedTarget = edge.target
            ? nodeIdMap.get(edge.target)
            : undefined;

          if (!remappedSource || !remappedTarget) return null;

          return {
            ...edge,
            id: getUniqueId(edge.id, usedEdgeIds, "ai-edge"),
            source: remappedSource,
            target: remappedTarget,
            selected: false,
          } as CustomEdgeType;
        })
        .filter((edge): edge is CustomEdgeType => edge !== null);

      applyChanges((state) => ({
        nodes: [...state.nodes, ...mappedNodes],
        edges: [...state.edges, ...mappedEdges],
        selectedNodeId: null,
        selectedEdgeId: null,
      }));

      setPrompt("");
      setOpen(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to generate diagram";
      toast.error(message);
    } finally {
      setIsloading(false);
    }
  };

  if (isLoading)
    return (
      <div className="fixed top-0 left-0 h-screen! w-screen! event-none flex items-center justify-center bg-black/50">
        <DiagramLoader />
      </div>
    );
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg rounded-2xl p-6">
        {/* HEADER */}
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Generate Diagram
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Describe your flow, system, or architecture clearly.
          </DialogDescription>
        </DialogHeader>

        {/* TEXTAREA */}
        <div className="mt-4 space-y-2">
          <Textarea
            placeholder="e.g. User logs in → backend validates → JWT issued → dashboard loads..."
            className="min-h-[140px] resize-none text-sm leading-relaxed"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />

          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Be specific for better diagrams</span>
            <span>{prompt.length}/500</span>
          </div>
        </div>

        {/* ACTIONS */}
        <DialogFooter className="mt-6 flex justify-between items-center">
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>

            <Button
              onKeyDown={(e) => {
                if (e.ctrlKey && e.key === "Enter") {
                  handleSubmit();
                }
              }}
              onClick={handleSubmit}
              disabled={!prompt.trim()}
            >
              Generate
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GenAiForm;
