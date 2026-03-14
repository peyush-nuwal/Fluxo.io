"use client";

import { use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import DiagramLoader from "@/components/ui/diagram-loader";
import ReactFlowProvider from "@/components/ReactFlowProvider";
import ToolSidebar from "@/components/canves/editor/tool-sidebar";
import FlowCanves from "@/components/flow";
import { useDiagramAutosave } from "@/hooks/use-diagram-autosave";
import { useDiagramStore } from "@/store/diagramsStore";
import { useDiagramEditorStore } from "@/store/diagramEditorStore";

type DiagramPageProps = {
  params: Promise<{
    diagramId: string;
  }>;
};

export default function DiagramPage({ params }: DiagramPageProps) {
  const { diagramId } = use(params);
  const {
    selectedDiagram: diagram,
    loading,
    error,
    fetchDiagramById,
    setSelectedDiagram,
  } = useDiagramStore();
  const loadDiagramData = useDiagramEditorStore(
    (state) => state.loadDiagramData,
  );
  const resetEditor = useDiagramEditorStore((state) => state.reset);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const hasInitializedEditorRef = useRef(false);

  useEffect(() => {
    let active = true;

    setHasLoadedOnce(false);
    setSelectedDiagram(null);
    resetEditor();
    hasInitializedEditorRef.current = false;

    void fetchDiagramById(diagramId).finally(() => {
      if (active) {
        setHasLoadedOnce(true);
      }
    });

    return () => {
      active = false;
      setSelectedDiagram(null);
      resetEditor();
      hasInitializedEditorRef.current = false;
    };
  }, [diagramId, fetchDiagramById, resetEditor, setSelectedDiagram]);

  useEffect(() => {
    if (
      !diagram ||
      diagram.id !== diagramId ||
      hasInitializedEditorRef.current
    ) {
      return;
    }

    loadDiagramData(diagram.data);
    hasInitializedEditorRef.current = true;
  }, [diagram, diagramId, loadDiagramData]);

  const autosaveEnabled = Boolean(
    diagram && hasLoadedOnce && !loading && !error,
  );
  const { saveStatus, saveMessage } = useDiagramAutosave(
    diagram?.id ?? null,
    autosaveEnabled,
  );

  const backHref = diagram?.project_id
    ? `/home?projectId=${diagram.project_id}`
    : "/home";

  const retryFetch = () => {
    hasInitializedEditorRef.current = false;
    void fetchDiagramById(diagramId);
  };

  const saveBadge =
    saveStatus === "pending"
      ? { label: "Unsaved", variant: "outline" as const }
      : saveStatus === "saving"
        ? { label: "Saving...", variant: "secondary" as const }
        : saveStatus === "saved"
          ? { label: "Saved", variant: "default" as const }
          : saveStatus === "error"
            ? { label: "Save failed", variant: "destructive" as const }
            : { label: "Ready", variant: "outline" as const };

  return (
    <div className="relative h-screen overflow-hidden">
      {(!hasLoadedOnce || loading) && !diagram ? (
        <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
          <DiagramLoader />
          <div className="space-y-1">
            <h1 className="text-xl font-semibold">Opening diagram</h1>
            <p className="text-sm text-muted-foreground">
              Loading the latest diagram data for this editor.
            </p>
          </div>
        </div>
      ) : null}

      {hasLoadedOnce && !loading && error ? (
        <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold">Unable to open diagram</h1>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button variant="outline" onClick={retryFetch}>
              <RefreshCcw className="size-4" />
              Retry
            </Button>
            <Button variant="ghost" asChild>
              <Link href={backHref}>Back to Sidebar</Link>
            </Button>
          </div>
        </div>
      ) : null}

      {hasLoadedOnce && !loading && !error && !diagram ? (
        <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold">Diagram not found</h1>
            <p className="text-sm text-muted-foreground">
              This diagram may have been removed or you may not have access to
              it anymore.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/home">Back to Sidebar</Link>
          </Button>
        </div>
      ) : null}

      {diagram ? (
        <>
          <div className="absolute left-4 top-4 z-20">
            <Button variant="outline" asChild>
              <Link href={backHref}>
                <ArrowLeft className="size-4" />
                Back to Sidebar
              </Link>
            </Button>
          </div>

          <div className="absolute right-4 top-4 z-20 flex flex-col items-end gap-2">
            <Badge variant={saveBadge.variant}>{saveBadge.label}</Badge>
            {saveStatus === "error" && saveMessage ? (
              <p className="max-w-xs text-right text-xs text-destructive">
                {saveMessage}
              </p>
            ) : null}
          </div>

          <div className="absolute left-4 top-20 z-20">
            <ToolSidebar />
          </div>

          <ReactFlowProvider>
            <div className="h-full w-full">
              <FlowCanves key={diagramId} />
            </div>
          </ReactFlowProvider>
        </>
      ) : null}
    </div>
  );
}
