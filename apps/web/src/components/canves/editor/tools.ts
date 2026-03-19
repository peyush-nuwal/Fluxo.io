export const TOOL_ITEMS = [
  { id: "hand", kind: "mode", label: "Hand", key: null },
  { id: "select", kind: "mode", label: "Select", key: "1" },
  { id: "text", kind: "insert", label: "Text", key: "2" },
  { id: "rectangle", kind: "insert", label: "Rectangle", key: "3" },
  { id: "diamond", kind: "insert", label: "Diamond", key: "4" },
  { id: "circle", kind: "insert", label: "Circle", key: "5" },

  { id: "arrow", kind: "insert", label: "Arrow", key: "6" },
  { id: "pencil", kind: "insert", label: "Draw", key: "7" },

  { id: "eraser", kind: "mode", label: "Eraser", key: "0" },
] as const;

export type VariantType = {
  id: string;
  icon: string;
};

export const borderVariants: VariantType[] = [
  { id: "solid", icon: "/assets/icons/solid.svg" },
  { id: "dashed", icon: "/assets/icons/solid.svg" },
  { id: "smoothstep", icon: "/assets/icons/solid.svg" },
];

export type DiagramToolItem = (typeof TOOL_ITEMS)[number];
export type DiagramToolId = DiagramToolItem["id"];
export type DiagramToolKind = DiagramToolItem["kind"];
