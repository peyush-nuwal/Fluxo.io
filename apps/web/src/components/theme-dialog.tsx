"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { useTheme } from "@/hooks/use-theme";
import { RotateCcw } from "lucide-react";

export const THEME_PALETTE = [
  { theme: "theme-blue", name: "Blue", color: "oklch(0.62 0.19 255)" },
  { theme: "theme-emerald", name: "Emerald", color: "oklch(0.72 0.17 145)" },
  { theme: "theme-teal", name: "Teal", color: "oklch(0.70 0.15 170)" },
  { theme: "theme-lime", name: "Lime", color: "oklch(0.78 0.20 125)" },
  { theme: "theme-tangerine", name: "Tangerine", color: "oklch(0.68 0.19 55)" },
  { theme: "theme-amber", name: "Amber", color: "oklch(0.73 0.17 75)" },
  { theme: "theme-gold", name: "Gold", color: "oklch(0.76 0.16 95)" },
  { theme: "theme-aqua", name: "Aqua", color: "oklch(0.70 0.14 190)" },
  { theme: "theme-cyan", name: "Cyan", color: "oklch(0.73 0.15 215)" },
  { theme: "theme-sky", name: "Sky", color: "oklch(0.70 0.16 230)" },
  { theme: "theme-indigo", name: "Indigo", color: "oklch(0.60 0.20 270)" },
  { theme: "theme-violet", name: "Violet", color: "oklch(0.62 0.22 285)" },
  { theme: "theme-fuchsia", name: "Fuchsia", color: "oklch(0.63 0.25 300)" },
  { theme: "theme-rose", name: "Rose", color: "oklch(0.64 0.24 15)" },
] as const;

export function ThemeDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { theme: activeTheme, setTheme, resetTheme } = useTheme();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[40vw] max-w-none">
        <DialogHeader>
          <DialogTitle>Choose theme</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-7 gap-2 px-4">
          {THEME_PALETTE.map(({ theme, name, color }) => {
            const isActive = activeTheme === theme;

            return (
              <Button
                key={theme}
                onClick={() => setTheme(theme)}
                style={{
                  background: color,
                  borderColor: color,
                }}
                className={`size-12  rounded-md border-2 p-0 transition
                  ${isActive ? "ring-2 ring-offset-2 ring-primary" : ""}
               `}
                title={name}
              />
            );
          })}
        </div>
        onC
        <Button
          onClick={resetTheme}
          variant={"outline"}
          size={"sm"}
          className="w-fit ml-auto cursor-pointer"
        >
          <RotateCcw /> Reset
        </Button>
        {/* put your theme buttons here */}
        <div className="grid grid-cols-3 gap-2"></div>
      </DialogContent>
    </Dialog>
  );
}
