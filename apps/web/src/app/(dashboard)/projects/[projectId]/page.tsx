"use client";

import { useParams } from "next/navigation";
import { ResourceView } from "@/components/resource-view";

const ProjectDiagramsPage = () => {
  const params = useParams<{ projectId: string }>();
  const rawProjectId = params?.projectId;
  const projectId = Array.isArray(rawProjectId)
    ? rawProjectId[0]
    : rawProjectId;

  if (!projectId) {
    return null;
  }

  return (
    <div className="flex-1 min-h-[calc(100vh-100px)] overflow-auto">
      <ResourceView projectId={projectId} />
    </div>
  );
};

export default ProjectDiagramsPage;
