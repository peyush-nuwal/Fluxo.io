"use client";

import { use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import DiagramLoader from "@/components/ui/diagram-loader";
import ReactFlowProvider from "@/components/canves/ReactFlowProvider";
import FlowCanves from "@/components/canves/flow";
import { useDiagramAutosave } from "@/hooks/use-diagram-autosave";
import { useDiagramStore } from "@/store/diagramsStore";
import { useDiagramEditorStore } from "@/store/diagramEditorStore";
import StyleToolbar from "@/components/canves/editor/StyleToolbar";
import ToolPanel from "@/components/canves/editor/tool-panel";
import NotFoundFlow from "@/app/not-found";
import CollabForm from "@/components/collab-form";
import GenAiForm from "@/components/gen-ai-form";

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
  const [isCollabFormOpen, setIsCollabFormOpen] = useState<boolean>(false);
  const [isGenAiFormOpen, setIsGenAiFormOpen] = useState<boolean>(false);
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
  const { saveStatus, saveMessage, triggerSave } = useDiagramAutosave(
    diagram?.id ?? null,
    autosaveEnabled,
  );

  useEffect(() => {
    if (!diagram) return;

    const onKeyDown = (event: KeyboardEvent) => {
      const key = typeof event.key === "string" ? event.key.toLowerCase() : "";
      if (!key) return;
      const isSaveHotkey = (event.metaKey || event.ctrlKey) && key === "s";
      if (!isSaveHotkey) return;

      event.preventDefault();
      triggerSave();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [diagram, triggerSave]);

  const backHref = "/home";

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

      {hasLoadedOnce && !loading && error ? <NotFoundFlow /> : null}

      {hasLoadedOnce && !loading && !error && !diagram ? (
        <NotFoundFlow />
      ) : null}

      {diagram ? (
        <>
          <div className="absolute left-4 top-4 z-20">
            <Button variant="outline" asChild>
              <Link href={backHref}>
                <ArrowLeft className="size-4" />
                Back
              </Link>
            </Button>
          </div>

          <div className="absolute right-5 top-5 z-20 flex flex-col items-end gap-2 ">
            <Badge variant={saveBadge.variant}>{saveBadge.label}</Badge>
            {saveStatus === "error" && saveMessage ? (
              <p className="max-w-xs text-right text-xs text-destructive">
                {saveMessage}
              </p>
            ) : null}
          </div>

          <div className="absolute left-1/2  top-4 -translate-x-1/2 z-20">
            <ToolPanel
              diagramId={diagramId}
              setCollabFormOpen={setIsCollabFormOpen}
              setGenAiFormOpen={setIsGenAiFormOpen}
            />
          </div>

          <div className="absolute left-4 top-20 z-20 ">
            <StyleToolbar />
          </div>
          <ReactFlowProvider>
            <div className="h-full w-full">
              <FlowCanves key={diagramId} />
            </div>
          </ReactFlowProvider>
          <GenAiForm open={isGenAiFormOpen} setOpen={setIsGenAiFormOpen} />
          <CollabForm
            open={isCollabFormOpen}
            setOpen={setIsCollabFormOpen}
            projectId={diagram.project_id}
          />
        </>
      ) : null}
    </div>
  );
}
