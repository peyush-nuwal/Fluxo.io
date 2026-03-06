"use client";
import React, { useState } from "react";
import ResourceItem from "./resource-item";
import CardUI from "./cardUi";
import type { DiagramResource } from "@/types/diagrams";

type Props = {
  resource: DiagramResource;
  mode?: "active" | "trash";
};

const ResourceCard = ({ resource, mode = "active" }: Props) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <ResourceItem
      resource={resource}
      mode={mode}
      onContextMenu={() => setMenuOpen(true)}
    >
      {(r, actions) => (
        <CardUI
          resource={r}
          menuOpen={menuOpen}
          onMenuOpenChange={setMenuOpen}
          onEdit={actions.onEdit}
          onDelete={actions.onDelete}
        />
      )}
    </ResourceItem>
  );
};

export default ResourceCard;
