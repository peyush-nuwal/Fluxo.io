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
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { JSX, useEffect, useMemo, useState } from "react";
import { NavProjects } from "./nav-projects";
import { NavFavorites } from "./nav-favorites";
import { NavMain } from "./nav-main";
import { NavSecondary } from "./nav-secondary";
import { NavUser } from "./nav-user";

// interface navOption{
//        title: string,
//       url: string,
//       icon: JSX.Element,
// }

type NavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
};

interface favorites {
  name: string;
  url: string;
  emoji: string;
}

export function AppSidebar() {
  const pathname = usePathname();

  const user = {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/assets/avatar.png",
  };
  // Menu items.
  const NavOptionPrimary: NavItem[] = [
    {
      title: "Home",
      url: "/dashboard",
      icon: Home,
    },
    {
      title: "Ask AI",
      url: "/ask-ai",
      icon: Sparkles,
    },
  ];

  const NavOptionSecondary: NavItem[] = [
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
    },
    {
      title: "Feedback",
      url: "/trash",
      icon: Send,
    },
    {
      title: "Documention",
      url: "/docs",
      icon: BookText,
    },
    {
      title: "Community",
      url: "/",
      icon: Globe,
    },
    {
      title: "Trash",
      url: "/Trash",
      icon: Trash2,
    },
  ];

  const Projects = [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ];

  const navFavoritesOptions: favorites[] = [
    {
      name: "Project Management & Task Tracking",
      url: "#",
      emoji: "📊",
    },
    {
      name: "Family Recipe Collection & Meal Planning",
      url: "#",
      emoji: "🍳",
    },
    {
      name: "Fitness Tracker & Workout Routines",
      url: "#",
      emoji: "💪",
    },
    {
      name: "Book Notes & Reading List",
      url: "#",
      emoji: "📚",
    },
    {
      name: "Sustainable Gardening Tips & Plant Care",
      url: "#",
      emoji: "🌱",
    },
    {
      name: "Language Learning Progress & Resources",
      url: "#",
      emoji: "🗣️",
    },
    {
      name: "Home Renovation Ideas & Budget Tracker",
      url: "#",
      emoji: "🏠",
    },
    {
      name: "Personal Finance & Investment Portfolio",
      url: "#",
      emoji: "💰",
    },
    {
      name: "Movie & TV Show Watchlist with Reviews",
      url: "#",
      emoji: "🎬",
    },
    {
      name: "Daily Habit Tracker & Goal Setting",
      url: "#",
      emoji: "✅",
    },
  ];

  const items = useMemo(
    () =>
      NavOptionPrimary.map((item) => ({
        ...item,
        isActive: pathname === item.url,
      })),
    [pathname],
  );

  return (
    <Sidebar collapsible="icon" className="[--sidebar-width-icon:4.5rem] ">
      {/* -----Header ----- */}
      <SidebarHeader className="px-3 py-2">
        <div className="flex items-center gap-2">
          {/* Logo */}
          <Image
            src="/assets/logo.svg"
            alt="Fluxo logo"
            width={50}
            height={50}
            className="shrink-0"
          />

          {/* App name (hide on collapse) */}
          <span className="font-bold text-2xl truncate group-data-[collapsible=icon]:hidden">
            Fluxo
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent className="scrollbar-minimal">
        {/* ---------- main navigation options -----------        */}
        <NavMain items={items} />
        {/* ---------- Projects -----------        */}
        <NavProjects projects={Projects} />
        {/* ---------- Favorites  -----------        */}
        <NavFavorites favorites={navFavoritesOptions} />
        {/* ---------- utilities -----------        */}
        <NavSecondary items={NavOptionSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
