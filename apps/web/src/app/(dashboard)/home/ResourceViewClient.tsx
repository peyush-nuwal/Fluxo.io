"use client";

import dynamic from "next/dynamic";
import type { ProjectResource } from "@/types";

const ResourceView = dynamic(
  () => import("@/components/resource-view").then((m) => m.ResourceView),
  { ssr: false },
);

type Props = {
  resources: ProjectResource[];
};

export default function ResourceViewClient({ resources }: Props) {
  return <ResourceView resources={resources} />;
}
