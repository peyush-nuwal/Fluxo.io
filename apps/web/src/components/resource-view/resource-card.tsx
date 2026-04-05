"use client";
import React, { useState } from "react";
import ResourceItem from "./resource-item";
import CardUI from "./cardUi";
import type { Resource } from "./types";

type Props = {
  resource: Resource;
  mode?: "active" | "trash";
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

const ResourceCard = ({
  resource,
  mode = "active",
  selected = false,
  onSelect,
  onOpenResource,
  onEditResource,
  onDeleteResource,
  resourceLabel,
}: Props) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <ResourceItem
      resource={resource}
      mode={mode}
      selected={selected}
      onSelect={onSelect}
      onContextMenu={() => setMenuOpen(true)}
      onOpenResource={onOpenResource}
      onEditResource={onEditResource}
      onDeleteResource={onDeleteResource}
      resourceLabel={resourceLabel}
    >
      {(r, actions) => (
        <CardUI
          resource={r}
          selected={selected}
          menuOpen={menuOpen}
          onMenuOpenChange={setMenuOpen}
          onEdit={actions.onEdit}
          onDelete={actions.onDelete}
          handleDoubleClick={actions.handleDoubleClick}
        />
      )}
    </ResourceItem>
  );
};

export default ResourceCard;
