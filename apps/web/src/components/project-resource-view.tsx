"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Layers, LayoutGrid, List } from "lucide-react";
import { toast } from "sonner";
import type { FilterOption } from "@/types/diagrams";
import type { ProjectType } from "@/types/project";
import { useProjectStore } from "@/store/projectsStore";
import { useModalStore } from "@/store/useModalStore";
import { SegmentRadioGroup } from "./ui/segment-radio";
import { Input } from "./ui/input";
import EmptyState from "./empty-state";
import ResourceListView from "./resource-view/resource-list-view";
import ResourceCardView from "./resource-view/resource-card-view";
import type { Resource } from "./resource-view/types";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useRouter } from "next/navigation";

const FILTER_OPTIONS: Array<{ value: FilterOption; label: string }> = [
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

const toTime = (value?: string | null) =>
  value ? new Date(value).getTime() : 0;

export default function ProjectResourceView() {
  const router = useRouter();
  const { projects, loading, fetchProject, deleteProject } = useProjectStore();
  const open = useModalStore((s) => s.open);
  const [layoutMode, setLayoutMode] = useState<"list" | "card">("card");
  const [filter, setFilter] = useState<FilterOption>("recently_updated");
  const [query, setQuery] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    void fetchProject();
  }, [fetchProject]);

  const projectResources = useMemo(
    () => projects.map(mapProjectToResource),
    [projects],
  );
  const projectById = useMemo(
    () => new Map(projects.map((project) => [project.id, project])),
    [projects],
  );

  const searchFilteredResources = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projectResources;

    return projectResources.filter((resource) => {
      const name = resource.name.toLowerCase();
      const desc = resource.description?.toLowerCase() ?? "";
      return name.includes(q) || desc.includes(q);
    });
  }, [projectResources, query]);

  const filteredResources = useMemo(() => {
    const copy = [...searchFilteredResources];

    switch (filter) {
      case "recently_created":
        return copy.sort((a, b) => toTime(b.created_at) - toTime(a.created_at));
      case "recently_updated":
        return copy.sort((a, b) => toTime(b.updated_at) - toTime(a.updated_at));
      case "name_asc":
        return copy.sort((a, b) => a.name.localeCompare(b.name));
      case "name_desc":
        return copy.sort((a, b) => b.name.localeCompare(a.name));
      case "public_only":
        return copy.filter((resource) => resource.is_public);
      case "private_only":
        return copy.filter((resource) => !resource.is_public);
      default:
        return copy;
    }
  }, [filter, searchFilteredResources]);

  useEffect(() => {
    if (!selectedProjectId) return;
    const stillVisible = filteredResources.some(
      (resource) => resource.id === selectedProjectId,
    );
    if (!stillVisible) setSelectedProjectId(null);
  }, [filteredResources, selectedProjectId]);

  const handleOpenProject = useCallback(
    (resource: Resource) => {
      const project = projectById.get(resource.id);
      if (!project) return;
      router.push(`/projects/${project.id}`);
    },
    [open, projectById],
  );

  const handleEditProject = useCallback(
    (resource: Resource) => {
      const project = projectById.get(resource.id);
      if (!project) return;
      open("ProjectForm", { mode: "edit", project });
    },
    [open, projectById],
  );

  const handleDeleteProject = useCallback(
    async (resource: Resource) => {
      const result = await deleteProject(resource.id);
      if (!result.success) {
        toast.error(result.message ?? "Failed to delete project");
        return;
      }
      toast.success(result.message ?? "Project deleted successfully");
      setSelectedProjectId((current) =>
        current === resource.id ? null : current,
      );
    },
    [deleteProject],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!selectedProjectId) return;
      if (event.key !== "Delete" && event.key !== "Backspace") return;

      const target = event.target as HTMLElement | null;
      const isTypingTarget =
        target?.isContentEditable ||
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT";

      if (isTypingTarget) return;

      const selectedResource = filteredResources.find(
        (resource) => resource.id === selectedProjectId,
      );
      if (!selectedResource) return;

      event.preventDefault();
      void handleDeleteProject(selectedResource);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [filteredResources, handleDeleteProject, selectedProjectId]);

  const hasAnyResources = projectResources.length > 0;
  const hasFilteredResults = filteredResources.length > 0;

  return (
    <div className="flex flex-col gap-5 py-5">
      <div className="flex gap-3 items-center justify-between px-6 md:px-8">
        <div />
        <div className="flex gap-3 items-center">
          <Input
            placeholder="Search projects..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-62.5"
          />
          <ProjectFilter filter={filter} onFilterChange={setFilter} />
          <SegmentRadioGroup
            value={layoutMode}
            onChange={setLayoutMode}
            options={[
              {
                value: "card",
                icon: <LayoutGrid className="size-4" />,
                label: <span className="sr-only">Card</span>,
              },
              {
                value: "list",
                icon: <List className="size-4" />,
                label: <span className="sr-only">List</span>,
              },
            ]}
          />
        </div>
      </div>

      {!loading && !hasAnyResources && (
        <EmptyState
          title="No projects yet"
          description="Create your first project to organize diagrams."
          icon={<Layers className="h-8 w-8 text-muted-foreground" />}
        />
      )}

      {!loading && hasAnyResources && !hasFilteredResults && (
        <EmptyState
          title="No results found"
          description="Try adjusting your search or filters."
          icon={<LayoutGrid className="h-8 w-8 text-muted-foreground" />}
        />
      )}

      {(loading || hasFilteredResults) &&
        (layoutMode === "list" ? (
          <ResourceListView
            resources={filteredResources}
            loading={loading}
            selectedResourceId={selectedProjectId}
            onSelectResource={setSelectedProjectId}
            onOpenResource={handleOpenProject}
            onEditResource={handleEditProject}
            onDeleteResource={handleDeleteProject}
            resourceLabel="project"
          />
        ) : (
          <ResourceCardView
            resources={filteredResources}
            loading={loading}
            selectedResourceId={selectedProjectId}
            onSelectResource={setSelectedProjectId}
            onOpenResource={handleOpenProject}
            onEditResource={handleEditProject}
            onDeleteResource={handleDeleteProject}
            resourceLabel="project"
          />
        ))}
    </div>
  );
}

function ProjectFilter({
  filter,
  onFilterChange,
}: {
  filter: FilterOption;
  onFilterChange: (value: FilterOption) => void;
}) {
  const currentLabel =
    FILTER_OPTIONS.find((opt) => opt.value === filter)?.label ?? "Filter";

  return (
    <Select
      value={filter}
      onValueChange={(value) => onFilterChange(value as FilterOption)}
    >
      <SelectTrigger className="w-full max-w-48">
        <SelectValue placeholder={currentLabel} />
      </SelectTrigger>
      <SelectContent
        side="bottom"
        align="end"
        position="popper"
        avoidCollisions={false}
      >
        <SelectGroup>
          {FILTER_OPTIONS.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="data-highlighted:bg-sidebar-accent data-highlighted:text-sidebar-primary"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
