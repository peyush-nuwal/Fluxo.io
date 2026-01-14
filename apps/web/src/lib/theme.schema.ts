import { z } from "zod";

export const ThemeSchema = z.enum([
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
]);

export const ModeSchema = z.enum(["light", "dark", "system"]);

export type Theme = z.infer<typeof ThemeSchema>;
export type Mode = z.infer<typeof ModeSchema>;
