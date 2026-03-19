import { ShapeKind } from "./types";

export const SHAPE_DEFAULT_SIZES: Record<
  ShapeKind,
  { width: number; height: number }
> = {
  rectangle: { width: 200, height: 100 },
  circle: { width: 120, height: 120 },
  diamond: { width: 140, height: 140 },
  line: { width: 200, height: 2 },
  text: { width: 150, height: 50 },
};
