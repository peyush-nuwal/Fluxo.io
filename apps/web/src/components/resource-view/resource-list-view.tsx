import React from "react";
import ResourceRow from "./resource-row";
import type { ProjectResource } from "@/types/diagrams";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
type Props = {
  resources: ProjectResource[];
};

const ResourceListView = ({ resources }: Props) => {
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
          {resources?.length ? (
            resources.map((r) => <ResourceRow key={r.id} resource={r} />)
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-sm">
                No data found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ResourceListView;
