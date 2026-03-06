"use client";
import React from "react";
import { Slot } from "@radix-ui/react-slot";
import type { Resource } from "./rowUi";
import { hardDeleteDiagram, softDeleteDiagram } from "@/lib/diagrams/client";
import { useDiagramStore } from "@/store/diagramsStore";

type Props = {
  resource: Resource;
  mode?: "active" | "trash";
  children:
    | React.ReactNode
    | ((
        resource: Resource,
        actions: { onEdit: () => void; onDelete: () => Promise<void> },
      ) => React.ReactNode);
  asChild?: boolean;
  onContextMenu?: (event: React.MouseEvent) => void;
};
const ResourceItem = ({
  resource,
  mode = "active",
  children,
  asChild,
  onContextMenu,
}: Props) => {
  const fetchDiagrams = useDiagramStore((state) => state.fetchDiagrams);
  const fetchTrashDiagrams = useDiagramStore(
    (state) => state.fetchTrashDiagrams,
  );

  const handleEdit = () => {
    // open edit modal
  };

  const handleDelete = async () => {
    if (!resource.id) return;
    try {
      if (mode === "trash") {
        await hardDeleteDiagram(resource.id);
        await fetchTrashDiagrams();
      } else {
        await softDeleteDiagram(resource.id);
      }
      if (mode === "active") {
        await fetchDiagrams();
      }
    } catch (error) {
      console.error("Failed to delete diagram", error);
    }
  };
  const Comp = asChild ? Slot : "div";

  const content =
    typeof children === "function"
      ? children(resource, { onEdit: handleEdit, onDelete: handleDelete })
      : children;

  return (
    <Comp
      data-resource-id={resource.id ?? undefined}
      onContextMenu={(e) => {
        e.preventDefault();
        // open actions menu
        onContextMenu?.(e);
      }}
    >
      {content}
    </Comp>
  );
};

export default ResourceItem;
