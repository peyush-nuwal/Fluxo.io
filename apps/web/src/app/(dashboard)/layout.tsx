"use client";

import dynamic from "next/dynamic";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/toaster";
import CommandMenu from "@/components/command-menu";
import { ThemeProvider } from "@/components/theme-provider";

const AppSidebar = dynamic(
  () => import("@/components/app-sidebar").then((m) => m.AppSidebar),
  { ssr: false },
);

export default function DashboardLayout({
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
        <div className="flex min-h-screen w-full">
          {/* Sidebar already defined INSIDE AppSidebar */}
          <AppSidebar />

          {/* This is REQUIRED */}
          <SidebarInset className="w-[calc(100%-20px)] flex-1 overflow-auto">
            {children}
          </SidebarInset>
          <CommandMenu />
          <Toaster />
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
}
