import {
  Home,
  Sparkles,
  Settings,
  Globe,
  Trash2,
  Frame,
  PieChart,
  Map,
} from "lucide-react";

import type { SidebarItem, UtilityNavItem } from "@/types/sidebar";

export const PRIMARY_NAV: SidebarItem[] = [
  {
    label: "Home",
    href: "/home",
    icon: Home,
    isActive: false,
  },
  {
    label: "Ask AI",
    href: "/ask-ai",
    icon: Sparkles,
    isActive: false,
  },
];

export const UTILITY_NAV: UtilityNavItem[] = [
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    isActive: false,
  },
  {
    label: "Community",
    href: "/community",
    icon: Globe,
    isActive: false,
  },
  {
    label: "Trash",
    href: "/trash",
    icon: Trash2,
    isActive: false,
  },
];
