"use client";
import { useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { filterOption_array } from "@/types/diagrams";
import type { ProjectType } from "@/types/project";
import { useProjectStore } from "@/store/projectsStore";
import { useModalStore } from "@/store/useModalStore";
import ResourceBrowser from "./resource-view/resource-browser";
import type { Resource } from "./resource-view/types";

const FILTER_OPTIONS: filterOption_array[] = [
  { value: "recently_created", label: "Recently Created" },
  { value: "recently_updated", label: "Recently Updated" },
  { value: "name_asc", label: "Name A-Z" },
  { value: "name_desc", label: "Name Z-A" },
  { value: "public_only", label: "Public Only" },
  { value: "private_only", label: "Private Only" },
];

const mapProjectToResource = (project: ProjectType): Resource => ({
  id: project.id,
  name: project.title,
  description: project.description,
  is_public: project.is_public,
  views: 0,
  thumbnail_url: project.thumbnail_url,
  owner_username: project.owner_username,
  owner_avatar_url: project.owner_avatar_url,
  created_at: project.created_at,
  updated_at: project.updated_at,
  deleted_at: project.deleted_at,
  is_active: project.deleted_at === null,
});

export default function ProjectResourceView() {
  const router = useRouter();
  const open = useModalStore((state) => state.open);
  const { projects, loading, fetchProject, deleteProject } = useProjectStore();

  useEffect(() => {
    void fetchProject();
  }, [fetchProject]);

  const resources = useMemo<Resource[]>(
    () => projects.map(mapProjectToResource),
    [projects],
  );

  const projectById = useMemo(
    () => new Map(projects.map((project) => [project.id, project])),
    [projects],
  );

  const handleOpenProject = useCallback(
    (resource: Resource) => {
      const project = projectById.get(resource.id);
      if (!project) return;
      router.push(`/projects/${project.id}`);
    },
    [projectById, router],
  );

  const handleEditProject = useCallback(
    (resource: Resource) => {
      const project = projectById.get(resource.id);
      if (!project) return;
      open("ProjectForm", { mode: "edit", project });
    },
    [open, projectById],
  );

  const handleDeleteProject = async (resource: Resource) => {
    const result = await deleteProject(resource.id);
    if (!result.success) {
      toast.error(result.message ?? "Failed to delete project");
      return;
    }
    toast.success(result.message ?? "Project deleted successfully");
  };

  return (
    <div className="">
      <ResourceBrowser
        resources={resources}
        loading={loading}
        filterOptions={FILTER_OPTIONS}
        defaultFilter="recently_updated"
        queryPlaceholder="Search projects..."
        emptyState={{
          title: "No projects yet",
          description: "Create your first project to organize diagrams.",
        }}
        onOpenResource={handleOpenProject}
        onEditResource={handleEditProject}
        onDeleteResource={handleDeleteProject}
        resourceLabel="project"
      />
    </div>
  );
}
