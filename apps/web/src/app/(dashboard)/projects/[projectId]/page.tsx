"use client";
import { useParams } from "next/navigation";
import { ResourceView } from "@/components/resource-view";
import { useProjectStore } from "@/store/projectsStore";

const ProjectDiagramsPage = () => {
  const params = useParams<{ projectId: string }>();
  const rawProjectId = params?.projectId;
  const { projects } = useProjectStore();
  const projectId = Array.isArray(rawProjectId)
    ? rawProjectId[0]
    : rawProjectId;

  const project = projects.find((project) => project.id === projectId);

  if (!projectId) {
    return null;
  }

  return (
    <div className="flex-1 min-h-[calc(100vh-100px)] overflow-auto">
      <ResourceView projectId={projectId} resourceLabel={project?.title} />
    </div>
  );
};

export default ProjectDiagramsPage;
