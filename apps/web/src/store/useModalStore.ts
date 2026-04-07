// stores/useModalStore.ts
import { create } from "zustand";

type ModalType =
  | "deleteDiagram"
  | "ProjectForm"
  | "DiagramForm"
  | "themeDialog"
  | "commandMenuDialog"
  | null;

type ModalStore = {
  modelType: ModalType;
  data?: unknown;
  open: (type: ModalType, data?: unknown) => void;
  close: () => void;
};

export const useModalStore = create<ModalStore>((set) => ({
  modelType: null,
  data: undefined,
  open: (modelType, data) => set({ modelType, data }),
  close: () => set({ modelType: null, data: undefined }),
}));
