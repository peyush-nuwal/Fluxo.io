"use client";

import { motion, cubicBezier } from "motion/react";

type DiagramLoaderProps = {
  className?: string;
};

const EASE = cubicBezier(0.785, 0.135, 0.15, 0.86);
const DURATION = 3;

export default function DiagramLoader({ className }: DiagramLoaderProps) {
  return (
    <div className="relative h-11 w-11 text-primary">
      {/* Dot */}
      <motion.div
        className="absolute h-1.5 w-1.5 rounded-full bg-current"
        style={{ top: 37, left: 19 }}
        animate={{
          x: [-18, 0, 18, 0, -18],
          y: [-18, 0, -18, -36, -18],
        }}
        transition={{
          duration: DURATION,
          repeat: Infinity,
          ease: EASE,
        }}
      />

      <svg viewBox="0 0 80 80" className="h-full w-full">
        <motion.rect
          x="8"
          y="8"
          width="64"
          height="64"
          fill="none"
          strokeWidth="10"
          className="stroke-muted-foreground"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="192 64 192 64"
          animate={{ strokeDashoffset: [0, 64, 128, 192, 256] }}
          transition={{
            duration: DURATION,
            repeat: Infinity,
            ease: EASE,
          }}
        />
      </svg>
    </div>
  );
}
