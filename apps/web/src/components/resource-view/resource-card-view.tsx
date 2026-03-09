import React from "react";
import ResourceCard from "./resource-card";
import type { DiagramResource } from "@/types/diagrams";
import CardSkeleton from "./resource-card-skeleton";

type Props = {
  resources: DiagramResource[];
  loading: boolean;
  mode?: "active" | "trash";
  selectedResourceId?: string | null;
  onSelectResource?: (resourceId: string) => void;
};

const ResourceCardView = ({
  resources,
  loading,
  mode = "active",
  selectedResourceId,
  onSelectResource,
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
          />
        ))}
    </div>
  );
};

export default ResourceCardView;
