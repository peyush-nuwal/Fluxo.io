"use client";
import type { ReactNode } from "react";
import { ReactFlowProvider as XYFlowProvider } from "@xyflow/react";

export default function ReactFlowProvider({
  children,
}: {
  children: ReactNode;
}) {
  return <XYFlowProvider>{children}</XYFlowProvider>;
}
