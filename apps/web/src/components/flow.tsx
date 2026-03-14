import {
  useCallback,
  useEffect,
  useRef,
  type MouseEvent as ReactMouseEvent,
} from "react";
import {
  Background,
  BackgroundVariant,
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
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { edgeTypes, type CustomEdgeType } from "@/components/edges";
import { nodeTypes, type CustomNodeType } from "@/components/nodes";
import {
  SHAPE_DEFAULT_SIZES,
  type ShapeKind,
} from "@/components/nodes/shapeNode";
import { useDiagramEditorStore } from "@/store/diagramEditorStore";

function isSameViewport(a: Viewport, b: Viewport) {
  return a.x === b.x && a.y === b.y && a.zoom === b.zoom;
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
  const clearSelection = useDiagramEditorStore((state) => state.clearSelection);
  const reactFlowInstanceRef = useRef<ReactFlowInstance<
    CustomNodeType,
    CustomEdgeType
  > | null>(null);

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

  const onNodesChange: OnNodesChange<CustomNodeType> = useCallback(
    (changes) => {
      const hasPersistentChange = changes.some(
        (change) => change.type !== "select" && change.type !== "dimensions",
      );

      setNodes(applyNodeChanges(changes, nodes) as CustomNodeType[], {
        markDirty: hasPersistentChange,
      });
    },
    [nodes, setNodes],
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
      setEdges(addEdge(connection, edges) as CustomEdgeType[]);
    },
    [edges, setEdges],
  );

  const onPaneClick = useCallback(
    (event: ReactMouseEvent) => {
      if (
        activeTool !== "text" &&
        activeTool !== "rectangle" &&
        activeTool !== "diamond" &&
        activeTool !== "circle"
      ) {
        clearSelection();
        return;
      }

      const instance = reactFlowInstanceRef.current;
      if (!instance) return;

      const position = instance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const shape = activeTool as ShapeKind;
      const defaultSize = SHAPE_DEFAULT_SIZES[shape];

      const node: CustomNodeType = {
        id: crypto.randomUUID(),
        position,
        type: "shape-node",
        data: {
          label:
            shape === "text"
              ? "Text"
              : shape === "diamond"
                ? "Diamond"
                : shape === "circle"
                  ? "Circle"
                  : "Rectangle",
          shape,
        },
        style: {
          width: defaultSize.width,
          height: defaultSize.height,
        },
      } as CustomNodeType;

      addNodeToEditor(node);
      setActiveTool("select");
    },
    [activeTool, addNodeToEditor, clearSelection, setActiveTool],
  );

  const onNodeClick: NodeMouseHandler<CustomNodeType> = useCallback(
    (_, node) => {
      if (activeTool === "eraser") {
        removeNode(node.id);
        setActiveTool("select");
        return;
      }

      setSelectedNodeId(node.id);
    },
    [activeTool, removeNode, setActiveTool, setSelectedNodeId],
  );

  const onEdgeClick: EdgeMouseHandler<CustomEdgeType> = useCallback(
    (_, edge) => {
      if (activeTool === "eraser") {
        removeEdge(edge.id);
        setActiveTool("select");
        return;
      }

      setSelectedEdgeId(edge.id);
    },
    [activeTool, removeEdge, setActiveTool, setSelectedEdgeId],
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
        onPaneClick={onPaneClick}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onMoveEnd={onMoveEnd}
        defaultViewport={viewport}
        panOnDrag={activeTool === "hand"}
        selectionOnDrag={activeTool === "select"}
        nodesDraggable={activeTool === "select"}
        elementsSelectable={activeTool === "select"}
        fitView={nodes.length === 0}
        colorMode={"dark"}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
        <MiniMap />
        <Controls />
      </ReactFlow>
    </div>
  );
}
