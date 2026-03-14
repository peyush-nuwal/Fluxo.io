import React, { useState } from "react";
import RowUI from "./rowUi";
import type { DiagramResource } from "@/types/diagrams";
import ResourceItem from "./resource-item";

type Props = {
  resource: DiagramResource;
  mode?: "active" | "trash";
  selected?: boolean;
  onSelect?: () => void;
};

const ResourceRow = ({
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
          onDoubleClick={actions.handleDoubleClick}
        />
      )}
    </ResourceItem>
  );
};

export default ResourceRow;
