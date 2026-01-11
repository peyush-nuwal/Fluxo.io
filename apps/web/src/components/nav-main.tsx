"use client";

import Link from "next/link";
import { type LucideIcon } from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

type NavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  isActive?: boolean;
};

export function NavMain({ items }: { items: NavItem[] }) {
  return (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem
          key={item.title}
          className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center px-2"
        >
          <SidebarMenuButton
            asChild
            isActive={item.isActive}
            className="
              py-4
              data-[active=true]:bg-foreground
              data-[active=true]:text-background
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
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
