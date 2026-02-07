import React from "react";
import ResourceCard from "./resource-card";
import type { ProjectResource } from "@/types/diagrams";

type Props = {
  resources: ProjectResource[];
};

const ResourceCardView = ({ resources }: Props) => {
  return (
    <div className="  w-full h-full grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5 px-5 items-start">
      {resources?.length ? (
        resources.map((r) => <ResourceCard key={r.id} resource={r} />)
      ) : (
        <div>No data found</div>
      )}
    </div>
  );
};

export default ResourceCardView;
