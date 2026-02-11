"use client";
import React from "react";
import { SidebarTrigger } from "./ui/sidebar";
import { Kbd, KbdGroup } from "./ui/kbd";
import { Send } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import TopbarBreadcrumbs from "./TopbarBreadcrumbs";
import { useModalStore } from "@/store/useModalStore";

const Topbar = () => {
  const openModal = useModalStore((s) => s.open);

  return (
    <div className="w-full h-16 flex items-center justify-between px-4 bg-card border-b border-b-border border-solid">
      <div className="flex items-center gap-5">
        <SidebarTrigger className="size-10!" />
        <TopbarBreadcrumbs />
      </div>
      <div className="flex items-center gap-5">
        <div className="relative ">
          <Input
            className=" min-w-3xs h-10 "
            placeholder="Search..."
            readOnly
            onClick={() => openModal("commandMenuDialog")}
          />
          <KbdGroup className="absolute top-1/2 -translate-y-1/2 right-2 bg-background!  rounded-lg px-2 py-1">
            <Kbd>Ctrl</Kbd>
            <span>+</span>
            <Kbd>k</Kbd>
          </KbdGroup>
        </div>
        <Button
          variant="default"
          size="sm"
          className="bg-blue-600 text-white hover:bg-blue-700 hove:text-gray-300 transition-colors ease-in duration-150"
        >
          <Send />
          Invite
        </Button>
      </div>
    </div>
  );
};

export default Topbar;
