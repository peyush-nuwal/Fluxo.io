import React from "react";
import ResourceRow from "./resource-row";
import type { DiagramResource } from "@/types/diagrams";
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
  resources: DiagramResource[];
  loading?: boolean;
};

const ResourceListView = ({ resources, loading = false }: Props) => {
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
              ? resources.map((r) => <ResourceRow key={r.id} resource={r} />)
              : null}
        </TableBody>
      </Table>
    </div>
  );
};

export default ResourceListView;
