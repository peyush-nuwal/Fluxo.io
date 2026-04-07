"use client";
import { useEffect, useMemo } from "react";
import { hardDeleteDiagram, softDeleteDiagram } from "@/lib/diagrams/client";
import { useDiagramStore } from "@/store/diagramsStore";
import type { filterOption_array } from "@/types/diagrams";
import ResourceBrowser from "./resource-browser";
import type { Resource } from "./types";

const FILTER_OPTIONS: filterOption_array[] = [
  { value: "last_viewed", label: "Last Viewed" },
  { value: "most_viewed", label: "Most Viewed" },
  { value: "recently_created", label: "Recently Created" },
  { value: "recently_updated", label: "Recently Updated" },
  { value: "name_asc", label: "Name A-Z" },
  { value: "name_desc", label: "Name Z-A" },
  { value: "public_only", label: "Public Only" },
  { value: "private_only", label: "Private Only" },
];

type ResourceViewProps = {
  mode?: "active" | "trash";
  projectId?: string;
  resourceLabel?: string;
};

const ResourceView = ({
  mode = "active",
  projectId,
  resourceLabel,
}: ResourceViewProps) => {
  const {
    diagrams,
    loading,
    fetchDiagrams,
    fetchProjectDiagrams,
    fetchTrashDiagrams,
  } = useDiagramStore();

  useEffect(() => {
    if (mode === "trash") {
      void fetchTrashDiagrams();
      return;
    }

    if (projectId) {
      void fetchProjectDiagrams(projectId);
      return;
    }

    void fetchDiagrams();
  }, [
    fetchDiagrams,
    fetchProjectDiagrams,
    fetchTrashDiagrams,
    mode,
    projectId,
  ]);

  const resources = useMemo<Resource[]>(
    () => (Array.isArray(diagrams) ? diagrams : []),
    [diagrams],
  );

  const handleDeleteDiagram = async (
    resource: Resource,
    deleteMode: "active" | "trash",
  ) => {
    if (!resource.id) return;

    if (deleteMode === "trash") {
      await hardDeleteDiagram(resource.id);
      await fetchTrashDiagrams();
      return;
    }

    await softDeleteDiagram(resource.id);

    if (projectId) {
      await fetchProjectDiagrams(projectId);
      return;
    }

    await fetchDiagrams();
  };

  return (
    <ResourceBrowser
      resources={resources}
      loading={loading}
      mode={mode}
      filterOptions={FILTER_OPTIONS}
      defaultFilter="last_viewed"
      queryPlaceholder="Search diagrams..."
      showAccessFilter={!projectId}
      emptyState={{
        title:
          mode === "trash"
            ? "Trash is empty"
            : projectId
              ? "No diagrams in this project"
              : "No diagrams yet",
        description:
          mode === "trash"
            ? "Deleted diagrams will appear here."
            : projectId
              ? "Create your first diagram in this project."
              : "Create your first diagram to get started.",
      }}
      onDeleteResource={handleDeleteDiagram}
      resourceLabel={resourceLabel}
    />
  );
};

export default ResourceView;
