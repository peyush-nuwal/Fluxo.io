"use client";
import { useCallback, useRef } from "react";
import ReactFlow, {
  addEdge,
  Background,
  BackgroundVariant,
  Handle,
  Position,
  type ReactFlowInstance,
  type NodeProps,
  type NodeTypes,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type Node,
} from "reactflow";
import "reactflow/dist/style.css";
import { useRouter } from "next/navigation";

const PRIMARY = "var(--primary)";
const ACCENT = "color-mix(in oklab, var(--primary) 72%, #38bdf8 28%)";
const SOFT = "color-mix(in oklab, var(--primary) 55%, #f59e0b 45%)";

const baseStyle = {
  padding: "12px 14px",
  borderRadius: "var(--radius-md)",
  background: "var(--color-card)",
  color: "var(--color-card-foreground)",
  border:
    "1px solid color-mix(in oklab, var(--primary) 30%, var(--color-border))",
  boxShadow: "0 10px 26px color-mix(in oklab, var(--primary) 12%, transparent)",
};

const heroStyle = {
  ...baseStyle,
  width: 280,
  height: 190,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "color-mix(in oklab, var(--primary) 88%, white 12%)",
  color: "var(--primary-foreground)",
  border: "1px solid color-mix(in oklab, var(--primary) 70%, white 30%)",
  borderRadius: "var(--radius-lg)",
  fontSize: "72px",
  fontWeight: 900,
  letterSpacing: "0.04em",
  padding: "0",
};

function SplitHandleNode({ data }: NodeProps<{ label: string }>) {
  return (
    <div>
      <Handle type="source" position={Position.Left} id="source-left" />
      <Handle type="source" position={Position.Right} id="source-right" />
      <Handle type="target" position={Position.Left} id="target-left" />
      <Handle type="target" position={Position.Right} id="target-right" />
      <Handle type="source" position={Position.Bottom} id="source-bottom" />
      <Handle type="target" position={Position.Bottom} id="target-bottom" />
      {data.label}
    </div>
  );
}

const nodeTypes: NodeTypes = {
  split: SplitHandleNode,
};

const initialNodes: Node[] = [
  {
    id: "404",
    type: "split",
    position: { x: -140, y: -95 },
    data: { label: "404" },
    style: heroStyle,
  },
  {
    id: "lost",
    position: { x: 270, y: -20 },
    data: { label: "wrong timeline" },
    sourcePosition: Position.Left,
    targetPosition: Position.Left,
    style: baseStyle,
  },
  {
    id: "home",
    position: { x: -430, y: 8 },
    data: { label: "go home ->" },
    sourcePosition: Position.Left,
    targetPosition: Position.Right,
    style: {
      ...baseStyle,
      background: "var(--primary)",
      color: "var(--primary-foreground) !important",
      cursor: "pointer",
    },
  },
  {
    id: "vibe1",
    position: { x: 20, y: 245 },
    data: { label: "click canvas to spawn glitches" },
    sourcePosition: Position.Top,
    targetPosition: Position.Top,
    style: baseStyle,
  },
  {
    id: "vibe2",
    position: { x: -390, y: -190 },
    data: { label: "map not loaded" },
    sourcePosition: Position.Right,
    targetPosition: Position.Right,
    style: baseStyle,
  },
  {
    id: "vibe3",
    position: { x: 400, y: -190 },
    data: { label: "404 is a mood" },
    sourcePosition: Position.Left,
    targetPosition: Position.Left,
    style: baseStyle,
  },
];

const initialEdges: Edge[] = [
  {
    id: "e1",
    source: "404",
    sourceHandle: "source-right",
    target: "lost",
    type: "smoothstep",
    animated: true,
    style: { stroke: PRIMARY, opacity: 0.88 },
  },
  {
    id: "e2",
    source: "404",
    sourceHandle: "source-left",
    target: "home",
    type: "default",
    animated: true,
    style: { stroke: ACCENT, opacity: 0.88 },
  },
  {
    id: "e3",
    source: "vibe2",
    target: "vibe3",
    type: "step",
    animated: true,
    style: { stroke: SOFT, strokeDasharray: "8 6", opacity: 0.85 },
  },
  {
    id: "e4",
    source: "404",
    sourceHandle: "source-bottom",
    target: "vibe1",
    type: "straight",
    animated: true,
    style: { stroke: PRIMARY, strokeWidth: 2.4, opacity: 0.9 },
  },
  {
    id: "e5",
    source: "404",
    sourceHandle: "source-left",
    target: "vibe2",
    type: "step",
    style: { stroke: PRIMARY, opacity: 0.52 },
  },
  {
    id: "e6",
    source: "404",
    sourceHandle: "source-right",
    target: "vibe3",
    type: "default",
    style: { stroke: PRIMARY, opacity: 0.52 },
  },
];

export default function NotFoundFlow() {
  const router = useRouter();
  const reactFlowRef = useRef<ReactFlowInstance | null>(null);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onPaneClick = useCallback(
    (event: { clientX: number; clientY: number }) => {
      const flowPos = reactFlowRef.current?.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      if (!flowPos) return;

      const id = Math.random().toString(36).slice(2, 7);
      const texts = [
        "still nothing",
        "404 again",
        "new branch",
        "lost route",
        "retry path",
      ];

      const newNode: Node = {
        id,
        position: {
          x: flowPos.x,
          y: flowPos.y,
        },
        data: {
          label: texts[Math.floor(Math.random() * texts.length)],
        },
        sourcePosition: Position.Top,
        targetPosition: Position.Bottom,
        style: {
          ...baseStyle,
          fontSize: "11px",
          opacity: 0.85,
          borderRadius: "999px",
          padding: "6px 10px",
        },
      };

      setNodes((nds) => [...nds, newNode]);
      setEdges((eds) =>
        addEdge(
          {
            id: `auto-${id}`,
            source: "404",
            sourceHandle: Math.random() > 0.5 ? "source-right" : "source-left",
            target: id,
            type: ["smoothstep", "step", "default", "straight"][
              Math.floor(Math.random() * 4)
            ] as Edge["type"],
            animated: true,
            style: {
              stroke: ACCENT,
              strokeDasharray: "5 5",
              opacity: 0.75,
            },
          },
          eds,
        ),
      );
    },
    [setEdges, setNodes],
  );

  const onConnect = useCallback(
    (params: Edge | Connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: ["smoothstep", "step", "default", "straight"][
              Math.floor(Math.random() * 4)
            ] as Edge["type"],
            animated: true,
            style: {
              stroke: ACCENT,
            },
          },
          eds,
        ),
      ),
    [setEdges],
  );

  const onNodeClick = (_event: unknown, node: Node) => {
    if (node.id === "home") {
      router.push("/home");
    }
  };

  return (
    <div className="relative h-screen w-full bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,color-mix(in_oklab,var(--color-primary)_14%,transparent)_0%,transparent_55%)]" />

      <ReactFlow
        onInit={(instance) => {
          reactFlowRef.current = instance;
        }}
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onPaneClick={onPaneClick}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        fitView
        fitViewOptions={{ padding: 0.32, minZoom: 0.6, maxZoom: 1.25 }}
        minZoom={0.45}
        maxZoom={1.7}
        defaultEdgeOptions={{ type: "smoothstep" }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          color="color-mix(in oklab, var(--primary) 30%, var(--color-border))"
          gap={24}
          size={1.2}
        />
        <Background
          id="grid-lines"
          variant={BackgroundVariant.Lines}
          color="color-mix(in oklab, var(--primary) 14%, #38bdf8 24%)"
          gap={96}
          size={0.5}
        />
      </ReactFlow>

      <div className="pointer-events-none absolute left-1/2 top-6 -translate-x-1/2 text-center">
        <h1 className="text-lg font-semibold tracking-tight">
          this 404 is interactive
        </h1>
        <p className="text-sm text-muted-foreground">
          click empty space to generate nodes
        </p>
      </div>

      <button
        onClick={() => router.push("/home")}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full border border-border bg-card px-5 py-2 text-sm shadow-sm transition hover:bg-accent"
      >
        back home
      </button>
    </div>
  );
}
