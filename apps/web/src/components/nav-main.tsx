import Link from "next/link";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import type { PrimaryNavItem } from "@/types/sidebar";

export function NavPrimary({ items, ...props }: { items: PrimaryNavItem[] }) {
  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem
              key={item.label}
              className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center px-2"
            >
              <SidebarMenuButton
                asChild
                isActive={item.isActive}
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
                tooltip={item.label}
              >
                <Link
                  href={item.href}
                  className="
                flex w-full items-center gap-3
                group-data-[collapsible=icon]:justify-center
              "
                >
                  <div className="flex size-10 items-center justify-center">
                    <item.icon className="size-5 stroke-[1.5]" />
                  </div>

                  <span className="text-base group-data-[collapsible=icon]:hidden">
                    {item.label}
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
