"use client";

import { useEffect, useRef } from "react";
import { useDiagramEditorStore } from "@/store/diagramEditorStore";
import { useReactFlow } from "@xyflow/react";
export function Eraser() {
  const pathRef = useRef<{ x: number; y: number }[]>([]);
  const isDrawing = useRef(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const removeNode = useDiagramEditorStore((s) => s.removeNode);
  const removeEdge = useDiagramEditorStore((s) => s.removeEdge);
  const nodes = useDiagramEditorStore((s) => s.nodes);
  const edges = useDiagramEditorStore((s) => s.edges);
  const { screenToFlowPosition } = useReactFlow();

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      isDrawing.current = true;
      pathRef.current = [];
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDrawing.current || !screenToFlowPosition) return;
      if ((e.buttons & 1) !== 1) {
        handleMouseUp();
        return;
      }

      // 🔥 screen coords (for drawing)
      const screenPoint = { x: e.clientX, y: e.clientY };

      // 🔥 flow coords (for collision)
      const flowPoint = screenToFlowPosition({
        x: e.clientX,
        y: e.clientY,
      });

      pathRef.current.push(screenPoint);

      drawTrail();

      checkCollision(flowPoint);
    };

    const handleMouseUp = () => {
      isDrawing.current = false;
      pathRef.current = [];

      const ctx = canvasRef.current?.getContext("2d");
      ctx?.clearRect(0, 0, window.innerWidth, window.innerHeight);
    };
    const handleBlur = () => {
      handleMouseUp();
    };

    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("blur", handleBlur);
    };
  }, [nodes, edges, screenToFlowPosition]);

  // 🎨 DRAW TRAIL
  const drawTrail = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // ✨ fade previous frame (THIS is the magic)
    ctx.fillStyle = "rgba(0,0,0,0.1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const path = pathRef.current;

    if (path.length < 2) return;

    ctx.strokeStyle = "red";
    ctx.lineWidth = 12;
    ctx.lineCap = "round";

    ctx.beginPath();

    for (let i = 1; i < path.length; i++) {
      ctx.moveTo(path[i - 1].x, path[i - 1].y);
      ctx.lineTo(path[i].x, path[i].y);
    }

    ctx.stroke();
  };
  // 🧠 COLLISION
  const checkCollision = (point: { x: number; y: number }) => {
    nodes.forEach((node) => {
      const { x, y } = node.position;

      const w =
        typeof node.style?.width === "number"
          ? node.style.width
          : parseFloat(node.style?.width as string) || 200;

      const h =
        typeof node.style?.height === "number"
          ? node.style.height
          : parseFloat(node.style?.height as string) || 100;

      if (
        point.x >= x &&
        point.x <= x + w &&
        point.y >= y &&
        point.y <= y + h
      ) {
        removeNode(node.id);
      }
    });

    edges.forEach((edge) => {
      const source = nodes.find((n) => n.id === edge.source);
      const target = nodes.find((n) => n.id === edge.target);
      if (!source || !target) return;

      const midX = (source.position.x + target.position.x) / 2;
      const midY = (source.position.y + target.position.y) / 2;

      const dist = Math.hypot(point.x - midX, point.y - midY);

      if (dist < 30) {
        removeEdge(edge.id);
      }
    });
  };

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-50"
    />
  );
}
