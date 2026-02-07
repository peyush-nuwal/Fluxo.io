"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Home,
  Star,
  Globe,
  ChevronRight,
  Frame,
  Trash2,
  Send,
  Settings,
  BookText,
  PieChart,
  Map,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import { usePathname } from "next/navigation";

import { useMemo } from "react";
import { NavProjects } from "./nav-projects";
import { NavFavorites } from "./nav-favorites";
import { NavPrimary } from "./nav-main";
import { NavUtilities } from "./nav-utility";
import { NavUser } from "./nav-user";
import { SidebarItem, UtilityNavItem } from "@/types/sidebar";
import { PRIMARY_NAV, PROJECT_NAV, UTILITY_NAV } from "@/config/sidebar";

export function AppSidebar() {
  const pathname = usePathname();

  const items = useMemo(
    () =>
      PRIMARY_NAV.map((item) => ({
        ...item,
        isActive: pathname === item.href,
      })),
    [pathname],
  );

  return (
    <Sidebar collapsible="icon" className="">
      {/* -----Header ----- */}
      <SidebarHeader className="px-3 py-2 mt-2">
        <div className="flex items-center gap-2">
          {/* Logo */}
          {/* <Image
            src="/assets/logo.svg"
            alt="Fluxo logo"
            width={50}
            height={50}
            className="shrink-0"
          /> */}
          <span className="text-sidebar-primary w-10 inline-flex items-center justify-center">
            <svg
              width="47"
              height="36"
              viewBox="0 0 437 376"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M437 129H298V266H139V376H0V110H139V0H437V129ZM19 247H139V129H19V247ZM159 129V247H278V129H159Z"
                fill="currentColor"
              />
            </svg>
          </span>

          {/* App name (hide on collapse) */}
          <span className="font-bold text-2xl truncate group-data-[collapsible=icon]:hidden ">
            Flu<span className="text-sidebar-primary">xo</span>
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent className="scrollbar-thin mt-5">
        {/* ---------- main navigation options -----------        */}
        <NavPrimary items={items} />
        {/* ---------- Projects -----------        */}
        <NavProjects projects={PROJECT_NAV} />

        {/* ---------- utilities -----------        */}
        <NavUtilities items={UTILITY_NAV} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter
        className="border-t border-t-border border-t-solid   group-data-[collapsible=icon]:items-center!
    group-data-[collapsible=icon]:justify-center!"
      >
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
