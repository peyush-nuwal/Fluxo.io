import React, { useState } from "react";
import RowUI from "./rowUi";
import type { DiagramResource } from "@/types/diagrams";
import ResourceItem from "./resource-item";

type Props = {
  resource: DiagramResource;
  mode?: "active" | "trash";
};

const ResourceRow = ({ resource, mode = "active" }: Props) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <ResourceItem
      resource={resource}
      mode={mode}
      asChild
      onContextMenu={() => setMenuOpen(true)}
    >
      {(r, actions) => (
        <RowUI
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

export default ResourceRow;
