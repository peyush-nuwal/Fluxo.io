"use client";
import React from "react";
import type { ProjectResource } from "@/types/diagrams";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, EllipsisVertical, Trash } from "lucide-react";

export type Resource = ProjectResource;

type Props = {
  resource: Resource;
  menuOpen: boolean;
  onMenuOpenChange: (open: boolean) => void;
} & Omit<React.ComponentPropsWithoutRef<typeof TableRow>, "resource">;

const RowUI = ({
  resource,
  menuOpen,
  onMenuOpenChange,
  ...rowProps
}: Props) => {
  return (
    <TableRow {...rowProps}>
      <TableCell className="font-medium">{resource.name}</TableCell>
      <TableCell>{resource.description ?? "-"}</TableCell>
      <TableCell>{resource.is_public ? "Public" : "Private"}</TableCell>
      <TableCell className="text-right">{resource.views}</TableCell>
      <TableCell className="text-right flex items-center justify-center ">
        <DropdownMenu open={menuOpen} onOpenChange={onMenuOpenChange}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <EllipsisVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem>
              <Edit />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">
              <Trash />
              Delete
              <DropdownMenuShortcut>Del</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};

export default RowUI;
