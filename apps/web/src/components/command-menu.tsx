"use client";

import {
  Calculator,
  Calendar,
  CreditCard,
  Palette,
  Settings,
  Smile,
  User,
} from "lucide-react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

import { useEffect, useState } from "react";
import { ThemeDialog } from "./theme-dialog";

const CommandMenu = () => {
  const [open, setOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // handle theme opening state
  const handleOpenThemeDialog = () => {
    setThemeOpen(true);
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-0 overflow-hidden [&>button]:top-3 [&>button]:right-3">
        <DialogTitle className="sr-only">Command Menu</DialogTitle>

        <Command className="rounded-lg border shadow-md">
          <CommandInput
            placeholder="Type a command or search…"
            className="h-12"
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>

            <CommandGroup heading="Suggestions">
              <CommandItem>
                <Calendar />
                <span>Calendar</span>
              </CommandItem>
              <CommandItem>
                <Smile />
                <span>Search Emoji</span>
              </CommandItem>
              <CommandItem disabled>
                <Calculator />
                <span>Calculator</span>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />

            <CommandGroup heading="Settings">
              <CommandItem>
                <User />
                <span>Profile</span>
              </CommandItem>
              <CommandItem onSelect={handleOpenThemeDialog}>
                <Palette />
                <span>Appearance</span>
              </CommandItem>
              <CommandItem>
                <CreditCard />
                <span>Billing</span>
              </CommandItem>
              <CommandItem>
                <Settings />
                <span>Settings</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>

      <ThemeDialog open={themeOpen} onOpenChange={setThemeOpen} />
    </Dialog>
  );
};

export default CommandMenu;
