"use client";

import dynamic from "next/dynamic";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/toaster";
import CommandMenu from "@/components/command-menu";
import { ThemeProvider } from "@/components/theme-provider";
import Topbar from "@/components/topbar";

const AppSidebar = dynamic(
  () => import("@/components/app-sidebar").then((m) => m.AppSidebar),
  { ssr: false },
);

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <SidebarProvider
        style={
          {
            "--sidebar-width-icon": "4.5rem",
          } as React.CSSProperties
        }
      >
        <div className="flex h-screen w-full">
          <AppSidebar />
          <SidebarInset className="flex-1 ">
            <Topbar />
            {children}
          </SidebarInset>

          <Toaster />
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
}
