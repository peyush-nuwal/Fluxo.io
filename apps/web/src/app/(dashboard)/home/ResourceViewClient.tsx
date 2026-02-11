"use client";

import dynamic from "next/dynamic";
import type { DiagramResource } from "@/types";

const ResourceView = dynamic(
  () => import("@/components/resource-view").then((m) => m.ResourceView),
  { ssr: false },
);

export default function ResourceViewClient() {
  return <ResourceView />;
}
