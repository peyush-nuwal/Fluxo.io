"use client";
import React, { useState } from "react";
import { Slot } from "@radix-ui/react-slot";
import type { Resource } from "./types";
import { hardDeleteDiagram, softDeleteDiagram } from "@/lib/diagrams/client";
import { useDiagramStore } from "@/store/diagramsStore";
import DeleteAlertDialog from "../delete-alert-dialog";
import { useModalStore } from "@/store/useModalStore";
import { useUser } from "@/hooks/use-user";

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
          canManage: boolean;
        },
      ) => React.ReactNode);
  asChild?: boolean;
  onContextMenu?: (event: React.MouseEvent) => void;
  selected?: boolean;
  onSelect?: () => void;
  onOpenResource?: (resource: Resource) => void;
  onEditResource?: (resource: Resource) => void;
  onDeleteResource?: (
    resource: Resource,
    mode: "active" | "trash",
  ) => Promise<void>;
  resourceLabel?: string;
};
const ResourceItem = ({
  resource,
  mode = "active",
  children,
  asChild,
  onContextMenu,
  selected = false,
  onSelect,
  onOpenResource,
  onEditResource,
  onDeleteResource,
  resourceLabel = "diagram",
}: Props) => {
  const open = useModalStore((s) => s.open);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const fetchDiagrams = useDiagramStore((state) => state.fetchDiagrams);
  const fetchTrashDiagrams = useDiagramStore(
    (state) => state.fetchTrashDiagrams,
  );
  const { user } = useUser();
  const router = useRouter();
  const normalizedOwner = resource.owner_username?.trim().toLowerCase();
  const normalizedUser = user?.user_name?.trim().toLowerCase();
  const canManage =
    resource.access_type === "owner" ||
    Boolean(
      normalizedOwner && normalizedUser && normalizedOwner === normalizedUser,
    );

  const handleDoubleClick = () => {
    if (onOpenResource) {
      onOpenResource(resource);
      return;
    }
    router.push(`/diagram/${resource.id}`);
  };

  const handleEdit = () => {
    if (!canManage) return;
    if (!resource.id) return;
    if (onEditResource) {
      onEditResource(resource);
      return;
    }
    open("DiagramForm", { mode: "edit", diagram: resource });
  };

  const performDelete = async () => {
    if (!resource.id) return;

    try {
      if (onDeleteResource) {
        await onDeleteResource(resource, mode);
        return;
      }
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
    if (!canManage) return;
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
          canManage,
        })
      : children;
  const slotChild = content as unknown as React.ComponentProps<
    typeof Slot
  >["children"];

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
        React.isValidElement(content) ? (
          <Slot {...itemProps}>{slotChild}</Slot>
        ) : (
          <div {...itemProps}>{content}</div>
        )
      ) : (
        <div {...itemProps}>{content}</div>
      )}
      {mode === "trash" && (
        <DeleteAlertDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          onConfirm={handleConfirmDelete}
          title={`Permanently delete this ${resourceLabel}?`}
          description={`"${resource.name}" will be permanently deleted and cannot be restored.`}
        />
      )}
    </>
  );
};

export default ResourceItem;
