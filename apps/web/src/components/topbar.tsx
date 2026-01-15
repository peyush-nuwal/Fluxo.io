import React from "react";
import { SidebarTrigger } from "./ui/sidebar";
import { Kbd, KbdGroup } from "./ui/kbd";

const Topbar = () => {
  return (
    <div className="w-full h-16 flex items-center justify-between px-2 bg-card border-b border-b-border border-solid">
      {" "}
      <SidebarTrigger className="size-10!" />
      <div className="bg-background border border-solid  rounded-md border-border px-3 py-2">
        <KbdGroup>
          <Kbd>Ctrl</Kbd>
          <span>+</span>
          <Kbd>k</Kbd>
        </KbdGroup>
      </div>
    </div>
  );
};

export default Topbar;
