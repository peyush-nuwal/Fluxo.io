import ResourceCard from "./resource-card";
import type { Resource } from "./types";
import CardSkeleton from "./resource-card-skeleton";

type Props = {
  resources: Resource[];
  loading: boolean;
  mode?: "active" | "trash";
  selectedResourceId?: string | null;
  onSelectResource?: (resourceId: string) => void;
  onOpenResource?: (resource: Resource) => void;
  onEditResource?: (resource: Resource) => void;
  onDeleteResource?: (
    resource: Resource,
    mode: "active" | "trash",
  ) => Promise<void>;
  resourceLabel?: string;
};

const ResourceCardView = ({
  resources,
  loading,
  mode = "active",
  selectedResourceId,
  onSelectResource,
  onOpenResource,
  onEditResource,
  onDeleteResource,
  resourceLabel,
}: Props) => {
  if (loading) {
    return (
      <div className="w-full h-full grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5 px-5 items-start">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }
  return (
    <div className="  w-full h-full grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5 px-5 items-start">
      {resources?.length &&
        resources.map((r) => (
          <ResourceCard
            key={r.id}
            resource={r}
            mode={mode}
            selected={selectedResourceId === r.id}
            onSelect={() => onSelectResource?.(r.id)}
            onOpenResource={onOpenResource}
            onEditResource={onEditResource}
            onDeleteResource={onDeleteResource}
            resourceLabel={resourceLabel}
          />
        ))}
    </div>
  );
};

export default ResourceCardView;
