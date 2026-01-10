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
  Trash2,
  Send,
  Settings,
  BookText,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { JSX, useEffect, useState } from "react";

// interface navOption{
//        title: string,
//       url: string,
//       icon: JSX.Element,
// }

export function AppSidebar() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Menu items.
  const NavOptionPrimary = [
    {
      title: "Home",
      url: "/dashboard",
      icon: Home,
    },
    {
      title: "Trash",
      url: "/Trash",
      icon: Trash2,
    },
    {
      title: "Favorites",
      url: "/",
      icon: Star,
    },
    {
      title: "Community",
      url: "/",
      icon: Globe,
    },
  ];

  const NavOptionSecondary = [
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
    },
    {
      title: "Feedback",
      url: "/Trash",
      icon: Send,
    },
    {
      title: "Documention",
      url: "/Docs",
      icon: BookText,
    },
    {
      title: "Community",
      url: "/",
      icon: Globe,
    },
  ];

  const Projects = [
    {
      title: "🚀 Fluxo",
      url: "/project/12",
    },
    {
      title: "📥 Inbox Manager",
      url: "/project/34",
    },
    {
      title: "📅 Team Calendar",
      url: "/project/56",
    },
    {
      title: "📊 Analytics Dashboard",
      url: "/project/78",
    },
    {
      title: "👥 CRM System",
      url: "/project/90",
    },
  ];

  return (
    <Sidebar collapsible="icon" className="[--sidebar-width-icon:4.5rem]">
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

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden text-sm">
            Application
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {NavOptionPrimary.map((item) => {
                const isActive = mounted && pathname === item.url;

                return (
                  <SidebarMenuItem
                    key={item.title}
                    className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center "
                  >
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className="
          py-5
          data-[active=true]:bg-foreground
          data-[active=true]:text-background

          group-data-[collapsible=icon]:w-full
          group-data-[collapsible=icon]:size-12!
          group-data-[collapsible=icon]:justify-center
        "
                    >
                      <Link
                        href={item.url}
                        className="
            flex w-full items-center gap-3
            group-data-[collapsible=icon]:justify-center
          "
                      >
                        <div className="flex size-10 items-center justify-center">
                          <item.icon className="size-6 stroke-[1.5]" />
                        </div>

                        <span className="group-data-[collapsible=icon]:hidden text-lg">
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* ---------- Projects -----------        */}
        <Collapsible
          defaultOpen
          className="group/collapsible group-data-[collapsible=icon]:hidden"
        >
          <SidebarGroup>
            {/* Label becomes the trigger */}
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className="flex w-full items-center justify-between ">
                <span className="text-sm!">Projects</span>
                <ChevronRight className="size-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>

            {/* Collapsible content */}
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {Projects.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <Link href={item.title}>
                          <span className="text-base ">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        {/* ---------- utiles -----------        */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              {NavOptionSecondary.map((item) => {
                const isActive = mounted && pathname === item.url;

                return (
                  <SidebarMenuItem
                    key={item.title}
                    className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center "
                  >
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className="
          py-5
          data-[active=true]:bg-foreground
          data-[active=true]:text-background

          group-data-[collapsible=icon]:w-full
          group-data-[collapsible=icon]:size-12!
          group-data-[collapsible=icon]:justify-center
        "
                    >
                      <Link
                        href={item.url}
                        className="
            flex w-full items-center gap-3
            group-data-[collapsible=icon]:justify-center
          "
                      >
                        <div className="flex size-10 items-center justify-center">
                          <item.icon className="size-6 stroke-[1.5]" />
                        </div>

                        <span className="group-data-[collapsible=icon]:hidden text-lg">
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
      <SidebarRail />
    </Sidebar>
  );
}
