"use client";

import {
  Folder,
  MoreHorizontal,
  Share,
  Trash2,
  ChevronRight,
  Plus,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import Link from "next/link";
import { ProjectNavItem } from "@/types/sidebar";
import { useEffect } from "react";
import { useProjectStore } from "@/store/projectsStore";
import { Button } from "./ui/button";
import { useModalStore } from "@/store/useModalStore";

type NavProjectsProps = {
  projects: ProjectNavItem[];
};

export function NavProjects({ projects: _projects }: NavProjectsProps) {
  const { isMobile } = useSidebar();
  const { projects: resources, fetchProject } = useProjectStore();
  const createProjectOpen = useModalStore((s) => s.open);
  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const onClickCreateProject = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    createProjectOpen("createProjectDialog");
  };
  return (
    <Collapsible
      defaultOpen
      className="group/collapsible group-data-[collapsible=icon]:hidden"
    >
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <CollapsibleTrigger asChild>
          <div className="flex w-full items-center justify-between group">
            <SidebarGroupLabel className="text-sm">Projects</SidebarGroupLabel>

            <div className="flex gap-2 items-center">
              <Button
                onClick={onClickCreateProject}
                size="sm"
                variant="ghost"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Plus className="size-4" />
              </Button>

              <ChevronRight className="size-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
            </div>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenu>
            {resources.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  className="hover:bg-sidebar-accent
  hover:text-sidebar-primary"
                >
                  <Link href={item.id}>
                    <span className="text-sm">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuAction showOnHover>
                      <MoreHorizontal />
                      <span className="sr-only">More</span>
                    </SidebarMenuAction>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-48"
                    side={isMobile ? "bottom" : "right"}
                    align={isMobile ? "end" : "start"}
                  >
                    <DropdownMenuItem>
                      <Folder className="text-muted-foreground" />
                      <span>View Project</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Share className="text-muted-foreground" />
                      <span>Share Project</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Trash2 className="text-muted-foreground" />
                      <span>Delete Project</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            ))}

            <SidebarMenuItem>
              <SidebarMenuButton
                className="text-sidebar-foreground/70  hover:bg-sidebar-accent
  hover:text-sidebar-primary"
              >
                <MoreHorizontal />
                <Link href={"#"}>
                  {" "}
                  <span>More</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
}
