"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import {
  ThemeSchema,
  ModeSchema,
  type Theme,
  type Mode,
} from "@/lib/theme.schema";

const THEME_KEY = "fluxo-theme";
const MODE_KEY = "fluxo-mode";

const ALL_THEMES: Theme[] = [
  "theme-blue",
  "theme-emerald",
  "theme-teal",
  "theme-lime",
  "theme-tangerine",
  "theme-amber",
  "theme-gold",
  "theme-aqua",
  "theme-cyan",
  "theme-sky",
  "theme-indigo",
  "theme-violet",
  "theme-fuchsia",
  "theme-rose",
];

export function useTheme() {
  const [theme, setTheme] = useState<Theme | null>(null);
  const [mode, setMode] = useState<Mode>("light");

  // ---- helpers ----
  const applyResolvedMode = (resolved: "light" | "dark") => {
    document.documentElement.classList.toggle("dark", resolved === "dark");
  };

  const getSystemMode = (): "light" | "dark" =>
    window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";

  // ---- mount (BEFORE PAINT) ----
  useLayoutEffect(() => {
    const storedTheme = ThemeSchema.safeParse(localStorage.getItem(THEME_KEY));
    const storedMode = ModeSchema.safeParse(localStorage.getItem(MODE_KEY));

    if (storedTheme.success) {
      applyTheme(storedTheme.data);
    }

    const initialMode = storedMode.success ? storedMode.data : "system";
    applyMode(initialMode);
  }, []);

  // ---- system listener (AFTER PAINT) ----
  useEffect(() => {
    if (mode !== "system") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const handler = () => {
      applyResolvedMode(getSystemMode());
    };

    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, [mode]);

  // ---- theme ----
  const applyTheme = (next: Theme) => {
    const root = document.documentElement;

    root.classList.remove(...ALL_THEMES);
    root.classList.add(next);

    localStorage.setItem(THEME_KEY, next);
    setTheme(next);
  };

  const resetTheme = () => {
    const root = document.documentElement;

    root.classList.remove(...ALL_THEMES);
    localStorage.removeItem(THEME_KEY);
    setTheme(null);
  };

  // ---- mode ----
  const applyMode = (next: Mode) => {
    localStorage.setItem(MODE_KEY, next);
    setMode(next);

    if (next === "system") {
      applyResolvedMode(getSystemMode());
    } else {
      applyResolvedMode(next);
    }
  };

  const toggleMode = () => {
    applyMode(mode === "dark" ? "light" : "dark");
  };

  return {
    theme,
    setTheme: applyTheme,
    resetTheme,

    mode,
    setMode: applyMode,
    toggleMode,
  };
}
