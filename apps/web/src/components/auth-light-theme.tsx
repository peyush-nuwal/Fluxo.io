"use client";

import { useEffect } from "react";

const ALL_THEMES = [
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

export function AuthLightTheme() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark");
    root.classList.remove(...ALL_THEMES);

    return () => {
      window.dispatchEvent(new Event("fluxo-theme-change"));
    };
  }, []);

  return null;
}
