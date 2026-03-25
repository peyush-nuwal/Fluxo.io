"use client";
import React, { useState } from "react";
import { Slot } from "@radix-ui/react-slot";
import type { Resource } from "./rowUi";
import { hardDeleteDiagram, softDeleteDiagram } from "@/lib/diagrams/client";
import { useDiagramStore } from "@/store/diagramsStore";
import DeleteAlertDialog from "../delete-alert-dialog";
import { useModalStore } from "@/store/useModalStore";

import { useRouter } from "next/navigation";

type Props = {
  resource: Resource;
  mode?: "active" | "trash";
  children:
    | React.ReactNode
    | ((
        resource: Resource,
        actions: {
          onEdit: () => void;
          onDelete: () => Promise<void>;
          handleDoubleClick: () => void;
        },
      ) => React.ReactNode);
  asChild?: boolean;
  onContextMenu?: (event: React.MouseEvent) => void;
  selected?: boolean;
  onSelect?: () => void;
};
const ResourceItem = ({
  resource,
  mode = "active",
  children,
  asChild,
  onContextMenu,
  selected = false,
  onSelect,
}: Props) => {
  const open = useModalStore((s) => s.open);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const fetchDiagrams = useDiagramStore((state) => state.fetchDiagrams);
  const fetchTrashDiagrams = useDiagramStore(
    (state) => state.fetchTrashDiagrams,
  );
  const router = useRouter();

  const handleDoubleClick = () => {
    router.push(`/diagram/${resource.id}`);
  };

  const handleEdit = () => {
    if (!resource.id) return;
    open("DiagramForm", { mode: "edit", diagram: resource });
  };

  const performDelete = async () => {
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
    } catch {
      // Keep UI responsive even if deletion fails.
    }
  };

  const handleDelete = async () => {
    if (mode === "trash") {
      setConfirmOpen(true);
      return;
    }

    await performDelete();
  };

  const handleConfirmDelete = async () => {
    await performDelete();
    setConfirmOpen(false);
  };

  const content =
    typeof children === "function"
      ? children(resource, {
          onEdit: handleEdit,
          onDelete: handleDelete,
          handleDoubleClick: handleDoubleClick,
        })
      : children;

  const itemProps = {
    "data-resource-id": resource.id ?? undefined,
    "data-state": selected ? "selected" : undefined,
    className: "cursor-pointer focus-visible:outline-none",
    tabIndex: 0,
    onClick: () => onSelect?.(),
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onSelect?.();
      }
    },
    onContextMenu: (e: React.MouseEvent) => {
      e.preventDefault();
      // open actions menu
      onContextMenu?.(e);
    },
  } as const;

  return (
    <>
      {asChild ? (
        <Slot {...(itemProps as any)}>{content as any}</Slot>
      ) : (
        <div {...itemProps}>{content}</div>
      )}
      {mode === "trash" && (
        <DeleteAlertDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          onConfirm={handleConfirmDelete}
          title="Permanently delete this diagram?"
          description={`"${resource.name}" will be permanently deleted and cannot be restored.`}
        />
      )}
    </>
  );
};

export default ResourceItem;
