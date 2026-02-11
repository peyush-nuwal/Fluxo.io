// stores/useModalStore.ts
import { create } from "zustand";

type ModalType =
  | "deleteDiagram"
  | "renameDiagram"
  | "createProject"
  | "createDiagramDialog"
  | "themeDialog"
  | "commandMenuDialog"
  | null;

type ModalStore = {
  modelType: ModalType;
  data?: any;
  open: (type: ModalType, data?: any) => void;
  close: () => void;
};

export const useModalStore = create<ModalStore>((set) => ({
  modelType: null,
  data: undefined,
  open: (modelType, data) => set({ modelType, data }),
  close: () => set({ modelType: null, data: undefined }),
}));
