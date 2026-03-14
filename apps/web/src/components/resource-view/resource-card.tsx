"use client";
import React, { useState } from "react";
import ResourceItem from "./resource-item";
import CardUI from "./cardUi";
import type { DiagramResource } from "@/types/diagrams";

type Props = {
  resource: DiagramResource;
  mode?: "active" | "trash";
  selected?: boolean;
  onSelect?: () => void;
};

const ResourceCard = ({
  resource,
  mode = "active",
  selected = false,
  onSelect,
}: Props) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <ResourceItem
      resource={resource}
      mode={mode}
      selected={selected}
      onSelect={onSelect}
      onContextMenu={() => setMenuOpen(true)}
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
