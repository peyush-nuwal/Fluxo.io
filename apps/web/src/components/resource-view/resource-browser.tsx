"use client";

import { useEffect, useMemo, useState } from "react";
import { Layers, LayoutGrid, List } from "lucide-react";
import type { FilterOption } from "@/types/diagrams";
import { SegmentRadioGroup } from "../ui/segment-radio";
import { Input } from "../ui/input";
import EmptyState from "../empty-state";
import ResourceListView from "./resource-list-view";
import ResourceCardView from "./resource-card-view";
import type { Resource } from "./types";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export type ResourceFilterOption = {
  value: FilterOption;
  label: string;
};

type ResourceBrowserProps = {
  resources: Resource[];
  loading: boolean;
  mode?: "active" | "trash";
  filterOptions: ResourceFilterOption[];
  defaultFilter: FilterOption;
  queryPlaceholder?: string;
  showAccessFilter?: boolean;
  emptyState: {
    title: string;
    description: string;
  };
  noResultsState?: {
    title: string;
    description: string;
  };
  onOpenResource?: (resource: Resource) => void;
  onEditResource?: (resource: Resource) => void;
  onDeleteResource?: (
    resource: Resource,
    mode: "active" | "trash",
  ) => Promise<void>;
  resourceLabel?: string;
};

const toTime = (value?: string | null) =>
  value ? new Date(value).getTime() : 0;

function applyFilter(resources: Resource[], filter: FilterOption): Resource[] {
  const copy = [...resources];

  switch (filter) {
    case "last_viewed":
      return copy.sort(
        (a, b) => toTime(b.last_opened_at) - toTime(a.last_opened_at),
      );
    case "most_viewed":
      return copy.sort((a, b) => b.views - a.views);
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
    case "active_only":
      return copy.filter((resource) => resource.is_active);
    default:
      return copy;
  }
}

const ResourceBrowser = ({
  resources,
  loading,
  mode = "active",
  filterOptions,
  defaultFilter,
  queryPlaceholder = "Search...",
  showAccessFilter = false,
  emptyState,
  noResultsState = {
    title: "No results found",
    description: "Try adjusting your search or filters.",
  },
  onOpenResource,
  onEditResource,
  onDeleteResource,
  resourceLabel,
}: ResourceBrowserProps) => {
  const [layoutMode, setLayoutMode] = useState<"list" | "card">("card");
  const [accessFilter, setAccessFilter] = useState<"all" | "mine" | "shared">(
    "all",
  );
  const [filter, setFilter] = useState<FilterOption>(defaultFilter);
  const [query, setQuery] = useState("");
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(
    null,
  );

  const accessFilteredResources = useMemo(() => {
    if (!showAccessFilter || mode !== "active") return resources;
    if (accessFilter === "all") return resources;
    if (accessFilter === "mine") {
      return resources.filter(
        (resource) => (resource.access_type ?? "owner") === "owner",
      );
    }
    return resources.filter((resource) => resource.access_type === "shared");
  }, [accessFilter, mode, resources, showAccessFilter]);

  const searchFilteredResources = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return accessFilteredResources;

    return accessFilteredResources.filter((resource) => {
      const name = resource.name?.toLowerCase() ?? "";
      const desc = resource.description?.toLowerCase() ?? "";
      return name.includes(q) || desc.includes(q);
    });
  }, [accessFilteredResources, query]);

  const filteredResources = useMemo(
    () => applyFilter(searchFilteredResources, filter),
    [filter, searchFilteredResources],
  );

  useEffect(() => {
    if (!selectedResourceId) return;
    const stillVisible = filteredResources.some(
      (resource) => resource.id === selectedResourceId,
    );
    if (!stillVisible) setSelectedResourceId(null);
  }, [filteredResources, selectedResourceId]);

  const hasAnyResources = resources.length > 0;
  const hasFilteredResults = filteredResources.length > 0;

  return (
    <div className="flex flex-col gap-5 py-5">
      <div className="flex gap-3 items-center justify-between px-6 md:px-8">
        {showAccessFilter && mode === "active" ? (
          <SegmentRadioGroup
            type="ghost"
            value={accessFilter}
            onChange={(value) =>
              setAccessFilter(value as "all" | "mine" | "shared")
            }
            options={[
              { value: "all", label: "All" },
              { value: "mine", label: "Mine" },
              { value: "shared", label: "Shared" },
            ]}
            className="text-base font-medium"
          />
        ) : (
          <div />
        )}

        <div className="flex gap-3 items-center">
          <Input
            placeholder={queryPlaceholder}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-62.5"
          />
          <DropDownFilter
            filter={filter}
            options={filterOptions}
            onFilterChange={setFilter}
          />
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
      <h1 className="text-2xl font-semibold  mx-3 lg:mx-6">
        {resourceLabel && resourceLabel}
      </h1>

      {!loading && !hasAnyResources && (
        <EmptyState
          title={emptyState.title}
          description={emptyState.description}
          icon={<Layers className="h-8 w-8 text-muted-foreground" />}
        />
      )}

      {!loading && hasAnyResources && !hasFilteredResults && (
        <EmptyState
          title={noResultsState.title}
          description={noResultsState.description}
          icon={<LayoutGrid className="h-8 w-8 text-muted-foreground" />}
        />
      )}

      {(loading || hasFilteredResults) &&
        (layoutMode === "list" ? (
          <ResourceListView
            resources={filteredResources}
            loading={loading}
            mode={mode}
            selectedResourceId={selectedResourceId}
            onSelectResource={setSelectedResourceId}
            onOpenResource={onOpenResource}
            onEditResource={onEditResource}
            onDeleteResource={onDeleteResource}
            resourceLabel={resourceLabel}
          />
        ) : (
          <ResourceCardView
            resources={filteredResources}
            loading={loading}
            mode={mode}
            selectedResourceId={selectedResourceId}
            onSelectResource={setSelectedResourceId}
            onOpenResource={onOpenResource}
            onEditResource={onEditResource}
            onDeleteResource={onDeleteResource}
            resourceLabel={resourceLabel}
          />
        ))}
    </div>
  );
};

export default ResourceBrowser;

function DropDownFilter({
  filter,
  options,
  onFilterChange,
}: {
  filter: FilterOption;
  options: ResourceFilterOption[];
  onFilterChange: (value: FilterOption) => void;
}) {
  const currentLabel =
    options.find((option) => option.value === filter)?.label ?? "Filter";

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
          {options.map((option) => (
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
