"use client";
import { File, Plus } from "lucide-react";
import ResourceViewClient from "./ResourceViewClient";

import { useModalStore } from "@/store/useModalStore";

export default function DashboardPage() {
  const open = useModalStore((s) => s.open);

  return (
    <div className="flex-1 min-h-[calc(100vh-100px)] overflow-auto">
      <div className="mt-20 px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl">
          <button
            type="button"
            onClick={() => open("createDiagramDialog")}
            className="bg-card/90 w-full rounded-2xl border border-border px-6 py-5 text-left flex items-center gap-4 group transition-all ease-out duration-200 hover:-translate-y-0.5 hover:border-foreground/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <div className="size-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Plus className="size-5 text-primary" />
            </div>
            <div className="flex flex-col">
              <h4 className="text-foreground font-semibold tracking-tight">
                Create a New File
              </h4>
              <p className="text-xs text-muted-foreground">
                Start from scratch with a blank canvas
              </p>
            </div>
          </button>

          <button
            type="button"
            className="bg-card/90 w-full rounded-2xl border border-border px-6 py-5 text-left flex items-center gap-4 group transition-all ease-out duration-200 hover:-translate-y-0.5 hover:border-foreground/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <div className="size-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <File className="size-5 text-primary" />
            </div>
            <div className="flex flex-col">
              <h4 className="text-foreground font-semibold tracking-tight">
                Generate an outline
              </h4>
              <p className="text-xs text-muted-foreground">
                Build structure from a prompt or topic
              </p>
            </div>
          </button>
        </div>
      </div>

      <ResourceViewClient />
    </div>
  );
}
