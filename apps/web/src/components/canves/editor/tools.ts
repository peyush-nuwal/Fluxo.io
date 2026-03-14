export const TOOL_ITEMS = [
  { id: "select", kind: "mode", label: "Select", key: "v" },
  { id: "hand", kind: "mode", label: "Hand", key: "h" },

  { id: "text", kind: "insert", label: "Text", key: "t" },
  { id: "rectangle", kind: "insert", label: "Rectangle", key: "r" },
  { id: "diamond", kind: "insert", label: "Diamond", key: "d" },
  { id: "circle", kind: "insert", label: "Circle", key: "o" },

  { id: "arrow", kind: "insert", label: "Arrow", key: "a" },
  { id: "line", kind: "insert", label: "Line", key: "l" },

  { id: "eraser", kind: "mode", label: "Eraser", key: "e" },
] as const;

export type DiagramToolItem = (typeof TOOL_ITEMS)[number];
export type DiagramToolId = DiagramToolItem["id"];
export type DiagramToolKind = DiagramToolItem["kind"];
