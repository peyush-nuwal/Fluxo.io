"use client";

import React from "react";
import Link from "next/link";
import { type LucideIcon } from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavSecondary({
  items,
  ...props
}: {
  items: {
    title: string;
    url: string;
    icon: LucideIcon;
    badge?: React.ReactNode;
  }[];
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem
              key={item.title}
              className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center px-2"
            >
              <SidebarMenuButton
                asChild
                className="
  py-4
  hover:bg-sidebar-accent
  hover:text-sidebar-primary
  data-[active=true]:bg-sidebar-primary
  data-[active=true]:text-sidebar-primary-foreground
  group-data-[collapsible=icon]:w-full
  group-data-[collapsible=icon]:size-10!
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
                    <item.icon className="size-5 stroke-[1.5]" />
                  </div>

                  <span className="text-base group-data-[collapsible=icon]:hidden">
                    {item.title}
                  </span>
                </Link>
              </SidebarMenuButton>

              {item.badge && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
