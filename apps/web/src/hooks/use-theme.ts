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
  const [mode, setMode] = useState<Mode>("system");

  // ---- helpers ----
  const applyResolvedMode = (resolved: "light" | "dark") => {
    document.documentElement.classList.toggle("dark", resolved === "dark");
  };

  const getSystemMode = (): "light" | "dark" =>
    window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";

  const dispatchThemeEvent = () => {
    window.dispatchEvent(new Event("fluxo-theme-change"));
  };

  const readStoredTheme = () => {
    const storedTheme = ThemeSchema.safeParse(localStorage.getItem(THEME_KEY));
    return storedTheme.success ? storedTheme.data : null;
  };

  const readStoredMode = () => {
    const storedMode = ModeSchema.safeParse(localStorage.getItem(MODE_KEY));
    return storedMode.success ? storedMode.data : "system";
  };

  const applyThemeInternal = (next: Theme | null) => {
    const root = document.documentElement;
    root.classList.remove(...ALL_THEMES);
    if (next) root.classList.add(next);
    setTheme(next);
  };

  const applyModeInternal = (next: Mode) => {
    setMode(next);
    if (next === "system") {
      applyResolvedMode(getSystemMode());
    } else {
      applyResolvedMode(next);
    }
  };

  // ---- mount (BEFORE PAINT) ----
  useLayoutEffect(() => {
    applyThemeInternal(readStoredTheme());
    applyModeInternal(readStoredMode());
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

  useEffect(() => {
    const syncFromStorage = () => {
      applyThemeInternal(readStoredTheme());
      applyModeInternal(readStoredMode());
    };

    const onStorage = (e: StorageEvent) => {
      if (e.key === THEME_KEY || e.key === MODE_KEY) {
        syncFromStorage();
      }
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("fluxo-theme-change", syncFromStorage);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("fluxo-theme-change", syncFromStorage);
    };
  }, []);

  // ---- theme ----
  const applyTheme = (next: Theme) => {
    localStorage.setItem(THEME_KEY, next);
    applyThemeInternal(next);
    dispatchThemeEvent();
  };

  const resetTheme = () => {
    localStorage.removeItem(THEME_KEY);
    applyThemeInternal(null);
    dispatchThemeEvent();
  };

  // ---- mode ----
  const applyMode = (next: Mode) => {
    localStorage.setItem(MODE_KEY, next);
    applyModeInternal(next);
    dispatchThemeEvent();
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
