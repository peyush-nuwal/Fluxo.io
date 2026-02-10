"use client";
import React, { useMemo, useState } from "react";
import ResourceListView from "./resource-list-view";
import ResourceCardView from "./resource-card-view";
import { SegmentRadioGroup } from "../ui/segment-radio";
import type {
  DropDownFilterProps,
  filterOption_array,
  ProjectResource,
} from "@/types/diagrams";
import { Layers, LayoutGrid, List } from "lucide-react";
import type { FilterOption } from "@/types/diagrams";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";
import EmptyState from "../empty-state";

interface ResourceViewInterface {
  resources: ProjectResource[];
}

const FILTER_OPTIONS: filterOption_array[] = [
  { value: "last_viewed", label: "Last Viewed" },
  { value: "most_viewed", label: "Most Viewed" },
  { value: "recently_created", label: "Recently Created" },
  { value: "recently_updated", label: "Recently Updated" },
  { value: "name_asc", label: "Name A-Z" },
  { value: "name_desc", label: "Name Z-A" },
  { value: "public_only", label: "Public Only" },
  { value: "private_only", label: "Private Only" },
  { value: "active_only", label: "Active Only" },
];

const ResourceView = ({ resources }: ResourceViewInterface) => {
  const [layoutMode, setLayoutMode] = useState<"list" | "card">("card");
  const [filter, setFilter] = useState<FilterOption>("last_viewed");
  const [query, setQuery] = useState("");

  const searchFilteredResources = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return resources;
    return resources.filter((r) => {
      const name = r.name?.toLowerCase() ?? "";
      const desc = r.description?.toLowerCase() ?? "";
      return name.includes(q) || desc.includes(q);
    });
  }, [query, resources]);

  const filteredResources = useMemo(() => {
    const copy = [...searchFilteredResources];

    const toTime = (value?: string | null) =>
      value ? new Date(value).getTime() : 0;

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
        return copy.filter((r) => r.is_public);
      case "private_only":
        return copy.filter((r) => !r.is_public);
      case "active_only":
        return copy.filter((r) => r.is_active);
      default:
        return copy;
    }
  }, [filter, searchFilteredResources]);

  const hasAnyResources = resources.length > 0;
  const hasFilteredResults = filteredResources.length > 0;
  const isSearching = query.trim().length > 0;
  return (
    <div className="flex flex-col gap-5 py-5 ">
      <div className="flex gap-3 items-center justify-end px-6 md:px-8  ">
        <Input
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-62.5"
        />
        <DropDownFilter filter={filter} onFilterChange={setFilter} />
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
      {/* 1️⃣ Real empty (should be rare) */}
      {!hasAnyResources && (
        <EmptyState
          title="No resources yet"
          description="Your project is ready. Start by creating your first resource."
          icon={<Layers className="h-8 w-8 text-muted-foreground" />}
        />
      )}

      {/* 2️⃣ Search / filter empty */}
      {hasAnyResources && !hasFilteredResults && (
        <EmptyState
          title="No results found"
          description="Try adjusting your search or filters."
          icon={<LayoutGrid className="h-8 w-8 text-muted-foreground" />}
        />
      )}

      {/* 3️⃣ Normal render */}
      {hasFilteredResults &&
        (layoutMode === "list" ? (
          <ResourceListView resources={filteredResources} loading={true} />
        ) : (
          <ResourceCardView resources={filteredResources} loading={true} />
        ))}
    </div>
  );
};

export default ResourceView;

const DropDownFilter = ({ filter, onFilterChange }: DropDownFilterProps) => {
  const currentLabel =
    FILTER_OPTIONS.find((opt) => opt.value === filter)?.label ?? "Filter";

  return (
    <Select
      value={filter}
      onValueChange={(v) => onFilterChange(v as FilterOption)}
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
          {FILTER_OPTIONS.map((opt) => (
            <SelectItem
              key={opt.value}
              value={opt.value}
              className="data-highlighted:bg-sidebar-accent
  data-highlighted:text-sidebar-primary   data-disabled:pointer-events-none  data-disabled:text-mauve8  "
            >
              {opt.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
