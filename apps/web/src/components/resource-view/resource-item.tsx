"use client";
import React from "react";
import { Slot } from "@radix-ui/react-slot";
import type { Resource } from "./rowUi";

type Props = {
  resource: Resource;
  children: React.ReactNode | ((resource: Resource) => React.ReactNode);
  asChild?: boolean;
  onContextMenu?: (event: React.MouseEvent) => void;
};
const ResourceItem = ({
  resource,
  children,
  asChild,
  onContextMenu,
}: Props) => {
  const handleEdit = () => {
    // open edit modal
  };

  const handleDelete = () => {
    // confirm + delete
  };
  const Comp = asChild ? Slot : "div";

  const content =
    typeof children === "function" ? children(resource) : children;

  return (
    <Comp
      data-resource-id={resource.id ?? undefined}
      onContextMenu={(e) => {
        e.preventDefault();
        // open actions menu
        onContextMenu?.(e);
      }}
    >
      {content}
    </Comp>
  );
};

export default ResourceItem;
