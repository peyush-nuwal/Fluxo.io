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

const GenAiForm = ({ open, setOpen }: GenAiFormProp) => {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsloading] = useState<boolean>(false);
  const setEdges = useDiagramEditorStore((s) => s.setEdges);
  const setNodes = useDiagramEditorStore((s) => s.setNodes);

  const handleSubmit = async () => {
    if (!prompt.trim()) return;
    setIsloading(true);
    try {
      const res = await generateDiagramFromPrompt(prompt);

      if (!res.success) {
        toast.error(res.message);
        return;
      }

      const edges = res.data.edges as CustomEdgeType[];
      const nodes = res.data.nodes as CustomNodeType[];

      setEdges(edges);
      setNodes(nodes);
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
      <div className="fixed top-0 left-0 h-screen! w-screen! event-none flex items-center justify-center bg-black/20">
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
