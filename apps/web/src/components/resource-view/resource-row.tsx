import { useState } from "react";
import RowUI from "./rowUi";
import type { Resource } from "./types";
import ResourceItem from "./resource-item";

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

const ResourceRow = ({
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
      asChild
      onContextMenu={() => setMenuOpen(true)}
      onOpenResource={onOpenResource}
      onEditResource={onEditResource}
      onDeleteResource={onDeleteResource}
      resourceLabel={resourceLabel}
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
