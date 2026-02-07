import React, { useState } from "react";
import RowUI from "./rowUi";
import type { ProjectResource } from "@/types/diagrams";
import ResourceItem from "./resource-item";

type Props = {
  resource: ProjectResource;
};

const ResourceRow = ({ resource }: Props) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <ResourceItem
      resource={resource}
      asChild
      onContextMenu={() => setMenuOpen(true)}
    >
      {(r) => (
        <RowUI
          resource={r}
          menuOpen={menuOpen}
          onMenuOpenChange={setMenuOpen}
        />
      )}
    </ResourceItem>
  );
};

export default ResourceRow;
