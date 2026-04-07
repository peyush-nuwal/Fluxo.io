import ResourceRow from "./resource-row";
import type { Resource } from "./types";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import RowSkeleton from "./resource-row-skeleton";
type Props = {
  resources: Resource[];
  loading?: boolean;
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

const ResourceListView = ({
  resources,
  loading = false,
  mode = "active",
  selectedResourceId,
  onSelectResource,
  onOpenResource,
  onEditResource,
  onDeleteResource,
  resourceLabel,
}: Props) => {
  const tableHeading = ["Name", "Description", "Visibility", "Views", ""];
  return (
    <div className="px-6">
      <Table>
        <TableHeader className="h-16 bg-card ">
          <TableRow>
            {tableHeading.map((heading, idx) => (
              <TableHead
                key={heading || "actions"}
                className={cn(
                  "text-base",
                  idx >= tableHeading.length - 2 && "text-right",
                )}
              >
                {heading}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <RowSkeleton key={`skeleton-${i}`} />
              ))
            : resources?.length
              ? resources.map((r) => (
                  <ResourceRow
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
                ))
              : null}
        </TableBody>
      </Table>
    </div>
  );
};

export default ResourceListView;
