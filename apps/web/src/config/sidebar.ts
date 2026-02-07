import {
  Home,
  Sparkles,
  Settings,
  Send,
  BookText,
  Globe,
  Trash2,
  Frame,
  PieChart,
  Map,
  Star,
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
  {
    label: "Favorites",
    href: "/favorites",
    icon: Star,
    isActive: false,
  },
];

export const PROJECT_NAV: SidebarItem[] = [
  {
    label: "Design Engineering",
    href: "/projects/design",
    icon: Frame,
  },
  {
    label: "Sales & Marketing",
    href: "/projects/sales",
    icon: PieChart,
  },
  {
    label: "Travel",
    href: "/projects/travel",
    icon: Map,
  },
];

export const UTILITY_NAV: UtilityNavItem[] = [
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
  {
    label: "Feedback",
    href: "/feedback",
    icon: Send,
  },
  {
    label: "Documentation",
    href: "/docs",
    icon: BookText,
  },
  {
    label: "Community",
    href: "/community",
    icon: Globe,
  },
  {
    label: "Trash",
    href: "/trash",
    icon: Trash2,
  },
];
