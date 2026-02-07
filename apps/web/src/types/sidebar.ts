import { LucideIcon } from "lucide-react";

export type SidebarItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  isActive?: boolean;
};

export type PrimaryNavItem = SidebarItem;

export type ProjectNavItem = SidebarItem;

export type UtilityNavItem = SidebarItem & {
  badge?: React.ReactNode;
};
