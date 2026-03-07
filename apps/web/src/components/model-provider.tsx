"use client";

import CommandMenu from "./command-menu";
import CreateDiagramDialog from "./create-diagram-dialog";
import { useModalStore } from "@/store/useModalStore";
import CreateProjectDialog from "./create-project-dialog";

export default function ModalProvider() {
  const { modelType } = useModalStore();

  return (
    <>
      <CommandMenu />
      {modelType === "createDiagramDialog" && <CreateDiagramDialog />}
      {modelType === "createProjectDialog" && <CreateProjectDialog />}
    </>
  );
}
