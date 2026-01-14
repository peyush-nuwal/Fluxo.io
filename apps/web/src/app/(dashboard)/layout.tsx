"use client";

import dynamic from "next/dynamic";
import { SidebarProvider } from "@/components/ui/sidebar";

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
    <SidebarProvider>
      <div className="flex min-h-screen w-full ">
        <AppSidebar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </SidebarProvider>
  );
}
