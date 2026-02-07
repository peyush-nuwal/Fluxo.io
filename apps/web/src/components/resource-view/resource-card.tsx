"use client";
import React, { useState } from "react";
import ResourceItem from "./resource-item";
import CardUI from "./cardUi";
import type { ProjectResource } from "@/types/diagrams";

type Props = {
  resource: ProjectResource;
};

const ResourceCard = ({ resource }: Props) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <ResourceItem resource={resource} onContextMenu={() => setMenuOpen(true)}>
      {(r) => (
        <CardUI
          resource={r}
          menuOpen={menuOpen}
          onMenuOpenChange={setMenuOpen}
        />
      )}
    </ResourceItem>
  );
};

export default ResourceCard;
