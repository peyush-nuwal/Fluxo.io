import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import {
  Background,
  BackgroundVariant,
  ControlButton,
  Controls,
  MiniMap,
  ReactFlow,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type EdgeMouseHandler,
  type NodeMouseHandler,
  type OnConnect,
  type OnEdgesChange,
  type OnInit,
  type OnNodesChange,
  type ReactFlowInstance,
  type Viewport,
  type XYPosition,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { CornerUpLeft, CornerUpRight } from "lucide-react";
import { edgeTypes, type CustomEdgeType } from "@/components/canves/edges";
import { nodeTypes, type CustomNodeType } from "@/components/canves/nodes";
import type { FreehandNodeType } from "./nodes/freehandNode";
import type { ShapeNodeType } from "./nodes/types";

import { useDiagramEditorStore } from "@/store/diagramEditorStore";
import { useTheme } from "@/hooks/use-theme";
import { DEFAULT_NODE_STYLE, ShapeKind } from "./nodes/types";
import { SHAPE_DEFAULT_SIZES } from "./nodes/nodes.config";

import { Eraser } from "./editor/Eraser";

function isSameViewport(a: Viewport, b: Viewport) {
  return a.x === b.x && a.y === b.y && a.zoom === b.zoom;
}

const MIN_DISTANCE = 300;
const DRAG_CREATE_THRESHOLD = 6;
const INSERTABLE_SHAPES: ShapeKind[] = [
  "text",
  "rectangle",
  "diamond",
  "circle",
];
const FREEHAND_TOOLS = ["pencil"] as const;
const FREEHAND_PADDING = 8;
const MIN_POINT_DISTANCE = 1.5;

type DraftCreateNode = {
  id: string;
  shape: ShapeKind;
  startPosition: { x: number; y: number };
  startClient: { x: number; y: number };
  moved: boolean;
};

type DraftFreehandNode = {
  id: string;
  points: XYPosition[];
  moved: boolean;
};

function getShapeLabel(shape: ShapeKind) {
  switch (shape) {
    case "text":
      return "Text";
    case "diamond":
      return "Diamond";
    case "circle":
      return "Circle";
    case "rectangle":
      return "Rectangle";
    case "line":
      return "Line";
    default:
      return "Node";
  }
}

function isInsertTool(tool: string): tool is ShapeKind {
  return INSERTABLE_SHAPES.includes(tool as ShapeKind);
}

function isFreehandTool(tool: string): tool is (typeof FREEHAND_TOOLS)[number] {
  return FREEHAND_TOOLS.includes(tool as (typeof FREEHAND_TOOLS)[number]);
}

function isPaneEvent(event: ReactMouseEvent) {
  const target = event.target;
  return !!(target instanceof Element && target.closest(".react-flow__pane"));
}

function isFreehandNode(node: CustomNodeType): node is FreehandNodeType {
  return node.type === "freehand-node";
}

function isShapeNode(node: CustomNodeType): node is ShapeNodeType {
  return node.type === "shape-node";
}

export default function FlowCanves() {
  const nodes = useDiagramEditorStore((state) => state.nodes);
  const edges = useDiagramEditorStore((state) => state.edges);
  const viewport = useDiagramEditorStore((state) => state.viewport);
  const activeTool = useDiagramEditorStore((state) => state.activeTool);
  const setNodes = useDiagramEditorStore((state) => state.setNodes);
  const setEdges = useDiagramEditorStore((state) => state.setEdges);
  const setViewport = useDiagramEditorStore((state) => state.setViewport);
  const setActiveTool = useDiagramEditorStore((state) => state.setActiveTool);
  const addNodeToEditor = useDiagramEditorStore((state) => state.addNode);
  const removeNode = useDiagramEditorStore((state) => state.removeNode);
  const removeEdge = useDiagramEditorStore((state) => state.removeEdge);
  const setSelectedNodeId = useDiagramEditorStore(
    (state) => state.setSelectedNodeId,
  );
  const setSelectedEdgeId = useDiagramEditorStore(
    (state) => state.setSelectedEdgeId,
  );
  const selectedEdgeId = useDiagramEditorStore((state) => state.selectedEdgeId);
  const selectedNodeId = useDiagramEditorStore((state) => state.selectedNodeId);
  const clearSelection = useDiagramEditorStore((state) => state.clearSelection);
  const undo = useDiagramEditorStore((state) => state.undo);
  const redo = useDiagramEditorStore((state) => state.redo);
  const canUndo = useDiagramEditorStore(
    (state) => state.historyPast.length > 0,
  );
  const canRedo = useDiagramEditorStore(
    (state) => state.historyFuture.length > 0,
  );
  const reactFlowInstanceRef = useRef<ReactFlowInstance<
    CustomNodeType,
    CustomEdgeType
  > | null>(null);
  const draftCreateRef = useRef<DraftCreateNode | null>(null);
  const draftFreehandRef = useRef<DraftFreehandNode | null>(null);
  const skipPaneClickRef = useRef(false);
  const [isInteractive, setIsInteractive] = useState(true);

  const { mode } = useTheme();

  const edgeVariant = useDiagramEditorStore((s) => s.edgeVariant);
  const edgeEndType = useDiagramEditorStore((s) => s.edgeEndType);

  useEffect(() => {
    const instance = reactFlowInstanceRef.current;
    if (!instance) return;

    const currentViewport = instance.getViewport();

    if (isSameViewport(currentViewport, viewport)) {
      return;
    }

    void instance.setViewport(viewport);
  }, [viewport]);

  const onInit: OnInit<CustomNodeType, CustomEdgeType> = useCallback(
    (instance) => {
      reactFlowInstanceRef.current = instance;

      if (!isSameViewport(instance.getViewport(), viewport)) {
        void instance.setViewport(viewport);
      }
    },
    [viewport],
  );

  const getClosestEdge = useCallback(
    (node: CustomNodeType, nodesList: CustomNodeType[]) => {
      const getCenter = (n: CustomNodeType) => {
        const width = Number(n.style?.width ?? 0);
        const height = Number(n.style?.height ?? 0);

        return {
          x: n.position.x + width / 2,
          y: n.position.y + height / 2,
        };
      };

      const getHandles = (
        sourceCenter: { x: number; y: number },
        targetCenter: { x: number; y: number },
      ) => {
        const dx = targetCenter.x - sourceCenter.x;
        const dy = targetCenter.y - sourceCenter.y;

        if (Math.abs(dx) >= Math.abs(dy)) {
          return dx >= 0
            ? { sourceHandle: "source-right", targetHandle: "target-left" }
            : { sourceHandle: "source-left", targetHandle: "target-right" };
        }

        return dy >= 0
          ? { sourceHandle: "source-bottom", targetHandle: "target-top" }
          : { sourceHandle: "source-top", targetHandle: "target-bottom" };
      };

      let closest: CustomNodeType | null = null;
      let minDistance = Number.MAX_VALUE;

      for (const currentNode of nodesList) {
        if (currentNode.id === node.id) continue;

        const a = getCenter(currentNode);
        const b = getCenter(node);

        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < minDistance && distance < MIN_DISTANCE) {
          minDistance = distance;
          closest = currentNode;
        }
      }

      if (!closest) return null;

      return {
        id: `${closest.id}-${node.id}`,
        source: closest.id,
        target: node.id,
        ...getHandles(getCenter(closest), getCenter(node)),
      };
    },
    [],
  );

  const onNodesChange: OnNodesChange<CustomNodeType> = useCallback(
    (changes) => {
      const hasPersistentChange = changes.some(
        (change) => change.type !== "select" && change.type !== "dimensions",
      );

      const updatedNodes = applyNodeChanges(changes, nodes) as CustomNodeType[];

      changes.forEach((change) => {
        if (change.type === "position" && !change.dragging) {
          const movedNode = updatedNodes.find(
            (nodeItem) => nodeItem.id === change.id,
          );
          if (!movedNode) return;
          if (movedNode.type !== "shape-node") return;

          const edge = getClosestEdge(movedNode, updatedNodes);
          if (!edge) return;

          setEdges((prevEdges) => {
            const exists = prevEdges.some(
              (existingEdge) =>
                (existingEdge.source === edge.source &&
                  existingEdge.target === edge.target) ||
                (existingEdge.source === edge.target &&
                  existingEdge.target === edge.source),
            );

            if (exists) return prevEdges;

            return addEdge(
              {
                ...edge,
                type: "button-edge",
                data: { variant: edgeVariant, endType: edgeEndType },
              },
              prevEdges,
            );
          });
        }
      });

      setNodes(updatedNodes, {
        markDirty: hasPersistentChange,
      });
    },
    [nodes, setNodes, setEdges, getClosestEdge, edgeVariant, edgeEndType],
  );

  const onEdgesChange: OnEdgesChange<CustomEdgeType> = useCallback(
    (changes) => {
      const hasPersistentChange = changes.some(
        (change) => change.type !== "select",
      );

      setEdges(applyEdgeChanges(changes, edges) as CustomEdgeType[], {
        markDirty: hasPersistentChange,
      });
    },
    [edges, setEdges],
  );

  const onConnect: OnConnect = useCallback(
    (connection) => {
      if (!isInteractive) return;

      const edge: CustomEdgeType = {
        ...connection,
        id: crypto.randomUUID(),
        type: "button-edge",
        data: {
          variant: edgeVariant,
          endType: edgeEndType,
        },
      } as CustomEdgeType;

      setEdges(addEdge(edge, edges) as CustomEdgeType[]);
    },
    [edges, setEdges, edgeVariant, edgeEndType, isInteractive],
  );

  const onFlowMouseDown = useCallback(
    (event: ReactMouseEvent) => {
      if (!isInteractive) return;
      if (event.button !== 0) return;
      if (!isPaneEvent(event)) return;

      const instance = reactFlowInstanceRef.current;
      if (!instance) return;

      if (isFreehandTool(activeTool)) {
        const startPosition = instance.screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });
        const nodeId = crypto.randomUUID();

        const draftNode: CustomNodeType = {
          id: nodeId,
          position: {
            x: startPosition.x - FREEHAND_PADDING,
            y: startPosition.y - FREEHAND_PADDING,
          },
          type: "freehand-node",
          data: {
            points: [{ x: FREEHAND_PADDING, y: FREEHAND_PADDING }],
            strokeWidth: 2,
          },
          style: { width: FREEHAND_PADDING * 2, height: FREEHAND_PADDING * 2 },
        } as CustomNodeType;

        addNodeToEditor(draftNode);
        draftFreehandRef.current = {
          id: nodeId,
          points: [startPosition],
          moved: false,
        };
        skipPaneClickRef.current = true;
        return;
      }

      if (!isInsertTool(activeTool)) return;

      const shape = activeTool;
      const startPosition = instance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const nodeId = crypto.randomUUID();

      const draftNode: CustomNodeType = {
        id: nodeId,
        position: startPosition,
        type: "shape-node",
        data: {
          label: getShapeLabel(shape),
          shape,
          style: { ...DEFAULT_NODE_STYLE },
        },
        style: {
          width: 1,
          height: 1,
        },
      } as CustomNodeType;

      addNodeToEditor(draftNode);
      draftCreateRef.current = {
        id: nodeId,
        shape,
        startPosition,
        startClient: { x: event.clientX, y: event.clientY },
        moved: false,
      };
      skipPaneClickRef.current = true;
    },
    [activeTool, addNodeToEditor, isInteractive],
  );

  const onFlowMouseMove = useCallback(
    (event: ReactMouseEvent) => {
      if ((event.buttons & 1) !== 1) {
        return;
      }

      const freehandDraft = draftFreehandRef.current;
      if (freehandDraft) {
        const instance = reactFlowInstanceRef.current;
        if (!instance) return;

        const nextPoint = instance.screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });
        const lastPoint = freehandDraft.points[freehandDraft.points.length - 1];
        const dx = nextPoint.x - lastPoint.x;
        const dy = nextPoint.y - lastPoint.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < MIN_POINT_DISTANCE) {
          return;
        }

        freehandDraft.moved = true;
        freehandDraft.points.push(nextPoint);

        const minX = Math.min(...freehandDraft.points.map((point) => point.x));
        const maxX = Math.max(...freehandDraft.points.map((point) => point.x));
        const minY = Math.min(...freehandDraft.points.map((point) => point.y));
        const maxY = Math.max(...freehandDraft.points.map((point) => point.y));

        const x = minX - FREEHAND_PADDING;
        const y = minY - FREEHAND_PADDING;
        const width = Math.max(
          maxX - minX + FREEHAND_PADDING * 2,
          FREEHAND_PADDING * 2,
        );
        const height = Math.max(
          maxY - minY + FREEHAND_PADDING * 2,
          FREEHAND_PADDING * 2,
        );

        const relativePoints = freehandDraft.points.map((point) => ({
          x: point.x - x,
          y: point.y - y,
        }));

        setNodes(
          (prevNodes) =>
            prevNodes.map((nodeItem) =>
              nodeItem.id === freehandDraft.id && isFreehandNode(nodeItem)
                ? {
                    ...nodeItem,
                    position: { x, y },
                    style: {
                      ...nodeItem.style,
                      width,
                      height,
                    },
                    data: {
                      ...(nodeItem.data ?? {}),
                      points: relativePoints,
                    },
                  }
                : nodeItem,
            ),
          { markDirty: false },
        );

        return;
      }

      const draft = draftCreateRef.current;
      if (!draft) return;

      const instance = reactFlowInstanceRef.current;
      if (!instance) return;

      const clientDx = event.clientX - draft.startClient.x;
      const clientDy = event.clientY - draft.startClient.y;
      const dragDistance = Math.sqrt(clientDx * clientDx + clientDy * clientDy);

      const currentPosition = instance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const left = Math.min(draft.startPosition.x, currentPosition.x);
      const top = Math.min(draft.startPosition.y, currentPosition.y);
      const width = Math.max(
        Math.abs(currentPosition.x - draft.startPosition.x),
        24,
      );
      const height = Math.max(
        Math.abs(currentPosition.y - draft.startPosition.y),
        24,
      );

      if (dragDistance >= DRAG_CREATE_THRESHOLD) {
        draft.moved = true;
      }

      if (!draft.moved) return;

      setNodes(
        (prevNodes) =>
          prevNodes.map((nodeItem) =>
            nodeItem.id === draft.id && isShapeNode(nodeItem)
              ? {
                  ...nodeItem,
                  position: { x: left, y: top },
                  style: {
                    ...nodeItem.style,
                    width,
                    height,
                  },
                }
              : nodeItem,
          ),
        { markDirty: false },
      );
    },
    [setNodes],
  );

  const onPaneMouseUp = useCallback(() => {
    const freehandDraft = draftFreehandRef.current;
    if (freehandDraft) {
      if (!freehandDraft.moved) {
        removeNode(freehandDraft.id);
      }

      draftFreehandRef.current = null;
      setActiveTool("select");
      return;
    }

    const draft = draftCreateRef.current;
    if (!draft) return;

    if (!draft.moved) {
      const defaultSize = SHAPE_DEFAULT_SIZES[draft.shape];

      setNodes((prevNodes) =>
        prevNodes.map((nodeItem) =>
          nodeItem.id === draft.id && isShapeNode(nodeItem)
            ? {
                ...nodeItem,
                style: {
                  ...nodeItem.style,
                  width: defaultSize.width,
                  height: defaultSize.height,
                },
              }
            : nodeItem,
        ),
      );
    }

    draftCreateRef.current = null;
    setActiveTool("select");
  }, [removeNode, setNodes, setActiveTool]);

  useEffect(() => {
    const isTypingTarget = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false;

      const tagName = target.tagName.toLowerCase();
      return (
        tagName === "input" ||
        tagName === "textarea" ||
        target.isContentEditable
      );
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const isModifier = event.metaKey || event.ctrlKey;
      const key = event.key.toLowerCase();
      const isUndoHotkey = isModifier && !event.shiftKey && key === "z";
      const isRedoHotkey =
        isModifier && ((event.shiftKey && key === "z") || key === "y");

      if (isUndoHotkey || isRedoHotkey) {
        if (isTypingTarget(event.target)) return;
        event.preventDefault();
        if (isUndoHotkey) undo();
        else redo();
        return;
      }

      if (!isInteractive) return;
      if (event.key !== "Delete" && event.key !== "Backspace") return;
      if (isTypingTarget(event.target)) return;

      const selectedNodeIds = new Set(
        nodes.filter((node) => node.selected).map((node) => node.id),
      );
      const selectedEdgeIds = new Set(
        edges.filter((edge) => edge.selected).map((edge) => edge.id),
      );

      if (selectedNodeId) selectedNodeIds.add(selectedNodeId);
      if (selectedEdgeId) selectedEdgeIds.add(selectedEdgeId);

      if (selectedNodeIds.size === 0 && selectedEdgeIds.size === 0) return;

      event.preventDefault();

      setNodes((prevNodes) =>
        prevNodes.filter((node) => !selectedNodeIds.has(node.id)),
      );

      setEdges((prevEdges) =>
        prevEdges.filter(
          (edge) =>
            !selectedEdgeIds.has(edge.id) &&
            !selectedNodeIds.has(edge.source) &&
            !selectedNodeIds.has(edge.target),
        ),
      );

      clearSelection();
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [
    nodes,
    edges,
    selectedNodeId,
    selectedEdgeId,
    setNodes,
    setEdges,
    clearSelection,
    isInteractive,
    undo,
    redo,
  ]);

  useEffect(() => {
    const handleWindowMouseUp = () => {
      onPaneMouseUp();
    };
    const handleWindowBlur = () => {
      onPaneMouseUp();
    };

    window.addEventListener("mouseup", handleWindowMouseUp);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      window.removeEventListener("mouseup", handleWindowMouseUp);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [onPaneMouseUp]);

  const onPaneClick = useCallback(() => {
    if (skipPaneClickRef.current) {
      skipPaneClickRef.current = false;
      return;
    }

    if (!isInsertTool(activeTool)) {
      clearSelection();
    }
  }, [activeTool, clearSelection]);

  const onNodeClick: NodeMouseHandler<CustomNodeType> = useCallback(
    (_, node) => {
      if (!isInteractive) return;

      if (activeTool === "eraser") {
        removeNode(node.id);
        setActiveTool("select");
        return;
      }

      setSelectedNodeId(node.id);
    },
    [activeTool, removeNode, setActiveTool, setSelectedNodeId, isInteractive],
  );

  const onEdgeClick: EdgeMouseHandler<CustomEdgeType> = useCallback(
    (_, edge) => {
      if (!isInteractive) return;

      if (activeTool === "eraser") {
        removeEdge(edge.id);
        setActiveTool("select");
        return;
      }

      setSelectedEdgeId(edge.id);
    },
    [activeTool, removeEdge, setActiveTool, setSelectedEdgeId, isInteractive],
  );

  const onMoveEnd = useCallback(
    (_event: MouseEvent | TouchEvent | null, nextViewport: Viewport) => {
      setViewport(nextViewport);
    },
    [setViewport],
  );

  return (
    <div className="h-full w-full fluxo-flow-theme">
      <ReactFlow<CustomNodeType, CustomEdgeType>
        onInit={onInit}
        nodes={nodes}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        edges={edges}
        edgeTypes={edgeTypes}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onMouseDown={onFlowMouseDown}
        onMouseMove={onFlowMouseMove}
        onMouseUp={onPaneMouseUp}
        onPaneClick={onPaneClick}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onMoveEnd={onMoveEnd}
        defaultViewport={viewport}
        panOnDrag={activeTool === "hand"}
        selectionOnDrag={isInteractive && activeTool === "select"}
        nodesDraggable={isInteractive && activeTool === "select"}
        nodesConnectable={isInteractive}
        elementsSelectable={isInteractive && activeTool === "select"}
        fitView={nodes.length === 0}
        colorMode={mode}
        defaultEdgeOptions={{
          type: "button-edge",
          data: { variant: "bezier", endType: edgeEndType },
        }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
        <MiniMap pannable zoomable />
        <Controls
          orientation="horizontal"
          className="canves-controls "
          onInteractiveChange={setIsInteractive}
        >
          <ControlButton
            onClick={undo}
            disabled={!canUndo}
            title="Undo (Ctrl/Cmd + Z)"
            aria-label="Undo"
          >
            <CornerUpLeft className="size-3.5" />
          </ControlButton>
          <ControlButton
            onClick={redo}
            disabled={!canRedo}
            title="Redo (Ctrl/Cmd + Shift + Z)"
            aria-label="Redo"
          >
            <CornerUpRight className="size-3.5" />
          </ControlButton>
        </Controls>
        {activeTool === "eraser" && <Eraser />}
      </ReactFlow>
    </div>
  );
}
