"use client";

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Palette,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

import { useState } from "react";
import { ThemeDialog } from "@/components/theme-dialog";
import { onLogout } from "@/lib/auth/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}) {
  const router = useRouter();
  const { isMobile } = useSidebar();
  const [themeOpen, setThemeOpen] = useState(false);

  // handle theme opening state
  const handleOpenThemeDialog = (e: Event) => {
    e.preventDefault();
    setThemeOpen(true);
  };

  const logoutHandler = async () => {
    try {
      const message = await onLogout();

      toast.success(message);
      router.replace("/dashboard");
    } catch (err: any) {
      toast.error(err?.message ?? "Logout failed");
    }
  };

  return (
    <SidebarMenu className="  group-data-[collapsible=icon]:items-center">
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="
    relative
    data-[state=open]:bg-sidebar-accent
    data-[state=open]:text-sidebar-accent-foreground


  "
            >
              <Avatar className="h-8 w-8 rounded-lg bg-red-500  items-center">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>

              <ChevronsUpDown className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center  gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                onSelect={handleOpenThemeDialog}
                className="data-highlighted:bg-sidebar-accent
    data-highlighted:text-sidebar-primary dp-group"
              >
                <Palette className="dp-group:text-sidebar-primary" />
                Appearance
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                className="data-highlighted:bg-sidebar-accent
    data-highlighted:text-sidebar-primary dp-group"
              >
                <BadgeCheck className="dp-group:text-sidebar-primary" />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem
                className="data-highlighted:bg-sidebar-accent
    data-highlighted:text-sidebar-primary dp-group"
              >
                <CreditCard className="dp-group:text-sidebar-primary" />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem
                className="data-highlighted:bg-sidebar-accent
    data-highlighted:text-sidebar-primary dp-group"
              >
                <Bell className="dp-group:text-sidebar-primary" />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="data-highlighted:bg-red-200/40
    data-highlighted:text-red-500 dp-group"
              onClick={logoutHandler}
            >
              <LogOut className="dp-group:text-red-500 " />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>

      <ThemeDialog open={themeOpen} onOpenChange={setThemeOpen} />
    </SidebarMenu>
  );
}
