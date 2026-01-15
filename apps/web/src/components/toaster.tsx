"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = () => {
  const { theme } = useTheme();

  const sonnerTheme: ToasterProps["theme"] =
    theme === "light" || theme === "dark" || theme === "system"
      ? theme
      : "system";

  return <Sonner theme={sonnerTheme} position="top-right" />;
};

export { Toaster };
