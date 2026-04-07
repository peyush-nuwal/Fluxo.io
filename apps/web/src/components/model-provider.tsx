"use client";
import CommandMenu from "./command-menu";
import DiagramForm from "./diagram-form";
import { useModalStore } from "@/store/useModalStore";
import ProjectForm from "./project-form";
import { ThemeDialog } from "./theme-dialog";

export default function ModalProvider() {
  const { modelType } = useModalStore();

  return (
    <>
      <CommandMenu />
      {modelType === "DiagramForm" && <DiagramForm />}
      {modelType === "ProjectForm" && <ProjectForm />}
      {modelType === "themeDialog" && <ThemeDialog />}
    </>
  );
}
