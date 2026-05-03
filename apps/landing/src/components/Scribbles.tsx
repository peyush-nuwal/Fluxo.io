"use client";

const scribbles = [
  // 🔵 Thick flowing curves (primary style)
  {
    d: "M0 40 Q 20 5, 40 35 T 80 30",
    c: "#a78bfa",
    w: 5,
    pos: "top-10 left-10 rotate-6",
  },
  {
    d: "M5 20 Q 30 60, 60 15 T 100 25",
    c: "#60a5fa",
    w: 6,
    pos: "top-16 right-20 -rotate-3",
  },
  {
    d: "M0 30 Q 25 0, 50 25 T 90 20",
    c: "#34d399",
    w: 5,
    pos: "bottom-16 left-16 rotate-3",
  },
  {
    d: "M5 25 Q 30 70, 65 20 T 110 30",
    c: "#fbbf24",
    w: 6,
    pos: "bottom-10 right-10 -rotate-6",
  },

  // 🟣 Long winding (mountain road style)
  {
    d: "M0 50 Q 20 10, 40 40 Q 60 70, 80 30",
    c: "#f472b6",
    w: 5,
    pos: "top-1/3 left-1/4 rotate-2",
  },
  {
    d: "M5 10 Q 30 50, 55 15 Q 80 0, 110 25",
    c: "#38bdf8",
    w: 6,
    pos: "top-1/2 right-1/4 -rotate-4",
  },

  // 🟢 Medium curves
  {
    d: "M0 35 Q 30 5, 60 30",
    c: "#fb923c",
    w: 5,
    pos: "bottom-1/3 left-1/3 rotate-3",
  },
  {
    d: "M10 20 Q 40 60, 80 20",
    c: "#22c55e",
    w: 5,
    pos: "bottom-1/4 right-1/3 -rotate-2",
  },

  // 🟡 Accent (few thin ones only)
  {
    d: "M0 20 Q 20 5, 40 20",
    c: "#c084fc",
    w: 2,
    pos: "top-1/4 right-10 rotate-6",
  },
  {
    d: "M5 15 Q 25 35, 45 15",
    c: "#fca5a5",
    w: 2.5,
    pos: "top-20 left-1/2 -rotate-3",
  },

  // 🔷 Extra scribbles (to reach 12+)
  {
    d: "M0 25 Q 25 65, 50 25 Q 75 5, 100 30",
    c: "#93c5fd",
    w: 6,
    pos: "bottom-24 left-10 rotate-4",
  },
  {
    d: "M5 30 Q 30 0, 60 25 T 100 20",
    c: "#86efac",
    w: 5,
    pos: "top-24 right-1/3 -rotate-5",
  },

  // 🧩 Small playful strokes
  {
    d: "M0 10 Q 15 25, 30 10",
    c: "#fde68a",
    w: 3,
    pos: "top-32 left-20 rotate-6",
  },
  {
    d: "M0 15 Q 20 30, 40 15",
    c: "#f9a8d4",
    w: 3,
    pos: "bottom-32 right-20 -rotate-6",
  },
];

export default function BackgroundScribbles() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {scribbles.map((s, i) => (
        <svg
          key={i}
          viewBox="0 0 120 120"
          className={`absolute ${s.pos} w-27.5 h-17.5 opacity-30`}
        >
          <path
            d={s.d}
            stroke={s.c}
            strokeWidth={s.w}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ))}
    </div>
  );
}
