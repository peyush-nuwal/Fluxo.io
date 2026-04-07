import { Label } from "@/components/ui/label";

import { useDiagramEditorStore } from "@/store/diagramEditorStore";
import { cn } from "@/lib/utils";
import { edgeVariants } from "../edges";

const EdgePathPanel = () => {
  const updateEdgeType = useDiagramEditorStore((s) => s.updateEdgeType);
  const edgeVariant = useDiagramEditorStore((s) => s.edgeVariant);
  const updateSelectedEdgeVariant = useDiagramEditorStore(
    (s) => s.updateSelectedEdgeVariant,
  );
  const selectedEdgeId = useDiagramEditorStore((s) => s.selectedEdgeId);
  return (
    <div className="flex flex-col gap-3">
      <Label>Arrow Type</Label>
      <div className="flex items-center justify-start gap-2">
        {edgeVariants.map((edge) => (
          <div
            key={edge.id}
            onClick={() => {
              updateEdgeType(edge.id);
              if (selectedEdgeId) updateSelectedEdgeVariant(edge.id);
            }}
            className={cn(
              "size-12 rounded-md bg-primary text-primary-foreground flex items-center justify-center",
              edgeVariant === edge.id
                ? "bg-primary"
                : "bg-muted  hover:bg-primary/40",
            )}
          >
            <edge.icon />
          </div>
        ))}
      </div>
    </div>
  );
};

export default EdgePathPanel;
