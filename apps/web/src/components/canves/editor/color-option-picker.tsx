"use client";
import { useEffect, useMemo, useState } from "react";
import { Pipette, Palette } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";

const BASE_COLORS_LIGHT = [
  "#ef4444",
  "#111827",
  "#f97316",
  "#facc15",
  "#84cc16",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];
const BASE_COLORS_DARK = [
  "#ffffff",
  "#9ca3af",
  "#111827",
  "#ef4444",
  "#f97316",
  "#facc15",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
];

const GRAY_SHADES = ["#f3f4f6", "#d1d5db", "#9ca3af", "#4b5563", "#111827"];
const SHADE_LIGHTNESS = [92, 76, 60, 44, 28];

type EyeDropperCtor = {
  new (): {
    open: () => Promise<{ sRGBHex: string }>;
  };
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function normalizeHex(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const withHash = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
  return /^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(withHash)
    ? withHash.toLowerCase()
    : null;
}

function expandHex(hex: string) {
  const normalized = hex.replace("#", "");
  if (normalized.length === 3) {
    return normalized
      .split("")
      .map((char) => `${char}${char}`)
      .join("");
  }

  return normalized;
}

function hexToRgb(hex: string) {
  const full = expandHex(hex);
  if (full.length !== 6) {
    return { r: 0, g: 0, b: 0 };
  }

  return {
    r: Number.parseInt(full.slice(0, 2), 16),
    g: Number.parseInt(full.slice(2, 4), 16),
    b: Number.parseInt(full.slice(4, 6), 16),
  };
}

function rgbToHsl(r: number, g: number, b: number) {
  const rr = r / 255;
  const gg = g / 255;
  const bb = b / 255;

  const max = Math.max(rr, gg, bb);
  const min = Math.min(rr, gg, bb);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === rr) h = ((gg - bb) / delta) % 6;
    else if (max === gg) h = (bb - rr) / delta + 2;
    else h = (rr - gg) / delta + 4;

    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }

  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

  return {
    h,
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function hslToHex(h: number, s: number, l: number) {
  const sat = clamp(s, 0, 100) / 100;
  const light = clamp(l, 0, 100) / 100;
  const c = (1 - Math.abs(2 * light - 1)) * sat;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = light - c / 2;

  let r = 0;
  let g = 0;
  let b = 0;

  if (h >= 0 && h < 60) {
    r = c;
    g = x;
  } else if (h < 120) {
    r = x;
    g = c;
  } else if (h < 180) {
    g = c;
    b = x;
  } else if (h < 240) {
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }

  const toHex = (value: number) =>
    Math.round((value + m) * 255)
      .toString(16)
      .padStart(2, "0");

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function getShadeRow(color: string) {
  const hex = normalizeHex(color) ?? "#3b82f6";
  const { r, g, b } = hexToRgb(hex);
  const hsl = rgbToHsl(r, g, b);

  if (hsl.s < 10) return GRAY_SHADES;

  return SHADE_LIGHTNESS.map((lightness) =>
    hslToHex(hsl.h, Math.max(hsl.s, 50), lightness),
  );
}

export function ColorOptionPicker({
  value,
  onChange,
  includeTransparent = false,
}: {
  value: string;
  onChange: (nextColor: string) => void;
  includeTransparent?: boolean;
}) {
  const { mode } = useTheme();
  const normalizedValue = normalizeHex(value) ?? "#3b82f6";
  const [hexDraft, setHexDraft] = useState(normalizedValue);
  const isDarkMode =
    mode === "dark" ||
    (mode === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  const baseColors = isDarkMode ? BASE_COLORS_DARK : BASE_COLORS_LIGHT;

  const shadeRow = useMemo(
    () => getShadeRow(normalizedValue),
    [normalizedValue],
  );

  useEffect(() => {
    setHexDraft(normalizedValue);
  }, [normalizedValue]);

  const pickFromScreen = async () => {
    const eyeDropperCtor = (
      window as unknown as { EyeDropper?: EyeDropperCtor }
    ).EyeDropper;

    if (!eyeDropperCtor) return;

    try {
      const eyeDropper = new eyeDropperCtor();
      const result = await eyeDropper.open();
      const next = normalizeHex(result.sRGBHex);
      if (!next) return;
      setHexDraft(next);
      onChange(next);
    } catch {
      // user cancelled
    }
  };

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center gap-1.5">
        {baseColors.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            className={cn(
              "size-8 rounded-sm border border-border",
              normalizedValue === color
                ? "ring-2 ring-primary ring-offset-1 ring-offset-background"
                : "ring-0",
            )}
            style={{ backgroundColor: color }}
          />
        ))}

        {includeTransparent && (
          <button
            type="button"
            onClick={() => onChange("transparent")}
            className={cn(
              "size-8 rounded-sm border border-border",
              value === "transparent"
                ? "ring-2 ring-primary ring-offset-1 ring-offset-background"
                : "ring-0",
            )}
            style={{
              background:
                "repeating-linear-gradient(45deg,#e5e7eb 0 4px,#fff 4px 8px)",
            }}
            title="Transparent"
          />
        )}

        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex size-8 items-center gap-1 rounded-md border border-border bg-background px-2 "
            >
              <Palette className="size-4.5" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="w-64 space-y-3 p-3"
            side="right"
            align="start"
          >
            <div className="space-y-1">
              <Label className="text-xs">Selected Color</Label>
              <div className="flex items-center gap-2">
                <div
                  className="size-7 rounded-md border border-border"
                  style={{ backgroundColor: normalizedValue }}
                />
                <span className="text-xs text-muted-foreground">
                  {normalizedValue}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Shades</Label>
              <div className="flex items-center gap-1.5">
                {shadeRow.map((shade) => (
                  <button
                    key={shade}
                    type="button"
                    onClick={() => {
                      setHexDraft(shade);
                      onChange(shade);
                    }}
                    className={cn(
                      "size-7 rounded-sm border border-border",
                      normalizedValue === shade
                        ? "ring-2 ring-primary ring-offset-1 ring-offset-background"
                        : "ring-0",
                    )}
                    style={{ backgroundColor: shade }}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">HEX</Label>
              <div className="flex items-center gap-2">
                <input
                  value={hexDraft}
                  onChange={(event) => {
                    setHexDraft(event.target.value);
                    const next = normalizeHex(event.target.value);
                    if (!next) return;
                    onChange(next);
                  }}
                  className="h-8 flex-1 rounded-md border border-border bg-background px-2 text-sm outline-none"
                />
                <button
                  type="button"
                  onClick={pickFromScreen}
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background"
                  title="Pick from screen"
                >
                  <Pipette className="size-4" />
                </button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
