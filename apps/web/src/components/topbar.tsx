"use client";
import { SidebarTrigger } from "./ui/sidebar";
import { Kbd, KbdGroup } from "./ui/kbd";
import { Send } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

import { useModalStore } from "@/store/useModalStore";

const Topbar = () => {
  const openModal = useModalStore((s) => s.open);

  return (
    <div className="w-full h-16 flex items-center justify-between px-2 sm:px-4 bg-card border-b border-b-border border-solid">
      <div className="flex items-center gap-2 sm:gap-5 min-w-0">
        <SidebarTrigger className="size-10!" />
      </div>
      <div className="flex items-center gap-2 sm:gap-3 md:gap-5 min-w-0">
        <div className="relative ">
          <Input
            className="h-10 w-32 sm:w-52 md:w-64 min-w-0"
            placeholder="Search..."
            readOnly
            onClick={() => openModal("commandMenuDialog")}
          />
          <KbdGroup className="hidden sm:flex absolute top-1/2 -translate-y-1/2 right-2 bg-background! rounded-lg px-2 py-1">
            <Kbd>Ctrl</Kbd>
            <span>+</span>
            <Kbd>k</Kbd>
          </KbdGroup>
        </div>
        <Button
          variant="default"
          size="sm"
          className="hidden sm:inline-flex bg-blue-600 text-white hover:bg-blue-700 hove:text-gray-300 transition-colors ease-in duration-150"
        >
          <Send />
          Invite
        </Button>
      </div>
    </div>
  );
};

export default Topbar;
