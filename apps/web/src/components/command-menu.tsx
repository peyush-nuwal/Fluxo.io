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
} from "@/components/ui/command";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

import { useEffect } from "react";
import { ThemeDialog } from "./theme-dialog";
import { useModalStore } from "@/store/useModalStore";

const CommandMenu = () => {
  const modelType = useModalStore((s) => s.modelType);
  const openModal = useModalStore((s) => s.open);
  const closeModal = useModalStore((s) => s.close);
  const menuOpen = modelType === "commandMenuDialog";

  const setMenuOpen = (open: boolean) => {
    if (open) {
      openModal("commandMenuDialog");
    } else if (menuOpen) {
      closeModal();
    }
  };

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (menuOpen) {
          closeModal();
        } else {
          openModal("commandMenuDialog");
        }
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [closeModal, menuOpen, openModal]);

  return (
    <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
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
              <CommandItem
                onSelect={() => {
                  openModal("themeDialog");
                  closeModal();
                }}
              >
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

      <ThemeDialog />
    </Dialog>
  );
};

export default CommandMenu;
