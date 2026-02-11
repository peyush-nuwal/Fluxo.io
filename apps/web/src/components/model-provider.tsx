"use client";

import CommandMenu from "./command-menu";
import CreateDiagramDialog from "./create-diagram-dialog";
import { useModalStore } from "@/store/useModalStore";

export default function ModalProvider() {
  const { modelType } = useModalStore();

  return (
    <>
      <CommandMenu />
      {modelType === "createDiagramDialog" && <CreateDiagramDialog />}
    </>
  );
}
