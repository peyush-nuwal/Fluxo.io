"use client";

import {
  Folder,
  MoreHorizontal,
  Share,
  Trash2,
  ChevronRight,
  Plus,
  Edit,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ProjectNavItem } from "@/types/sidebar";
import { useEffect, useMemo, useState } from "react";
import { useProjectStore } from "@/store/projectsStore";
import { Button } from "./ui/button";
import { useModalStore } from "@/store/useModalStore";
import { ProjectType } from "@/types/project";
import DeleteAlertDialog from "./delete-alert-dialog";
import { toast } from "sonner";

type NavProjectsProps = {
  projects: ProjectNavItem[];
};

export function NavProjects({ projects: _projects }: NavProjectsProps) {
  const { isMobile } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();
  const {
    projects: resources,
    loading,
    fetchProject,
    deleteProject,
  } = useProjectStore();
  const projectResources = Array.isArray(resources) ? resources : [];
  const createProjectOpen = useModalStore((s) => s.open);
  const showLoadingState = loading && projectResources.length === 0;
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );
  const activeProjectId = pathname === "/home" ? selectedProjectId : null;
  const [pendingDeleteProjectId, setPendingDeleteProjectId] = useState<
    string | null
  >(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  useEffect(() => {
    const projectIdToTrack = pendingDeleteProjectId ?? activeProjectId;
    if (!projectIdToTrack) return;
    const stillVisible = projectResources.some(
      (project) => project.id === projectIdToTrack,
    );
    if (!stillVisible) {
      setPendingDeleteProjectId(null);
      setConfirmDeleteOpen(false);
    }
  }, [activeProjectId, pendingDeleteProjectId, projectResources]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!activeProjectId) return;
      if (event.key !== "Delete" && event.key !== "Backspace") return;

      const target = event.target as HTMLElement | null;
      const isTypingTarget =
        target?.isContentEditable ||
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT";

      if (isTypingTarget) return;

      event.preventDefault();
      setPendingDeleteProjectId(activeProjectId);
      setConfirmDeleteOpen(true);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeProjectId]);

  const onClickCreateProject = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    createProjectOpen("ProjectForm", { mode: "create" });
  };

  const handleEditProject = (project: ProjectType) => {
    createProjectOpen("ProjectForm", { mode: "edit", project });
  };

  const getProjectHref = (_projectId: string) => "/home";

  const handleOpenProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    router.push(getProjectHref(projectId));
  };

  const projectIdToDelete = pendingDeleteProjectId ?? activeProjectId;
  const selectedProject = useMemo(
    () =>
      projectResources.find((project) => project.id === projectIdToDelete) ??
      null,
    [projectIdToDelete, projectResources],
  );

  const requestDeleteProject = (projectId: string) => {
    setPendingDeleteProjectId(projectId);
    setConfirmDeleteOpen(true);
  };

  const handleDeleteSelectedProject = async () => {
    if (!projectIdToDelete) return;

    const result = await deleteProject(projectIdToDelete);
    if (!result.success) {
      toast.error(result.message ?? "Failed to delete project");
      return;
    }

    toast.success(result.message ?? "Project deleted successfully");
    if (activeProjectId === projectIdToDelete && pathname === "/home") {
      router.replace("/home");
    }
    setConfirmDeleteOpen(false);
    setPendingDeleteProjectId(null);
  };

  return (
    <Collapsible
      defaultOpen
      className="group/collapsible group-data-[collapsible=icon]:hidden"
    >
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <CollapsibleTrigger asChild>
          <div className="flex w-full items-center justify-between group/sidebar-label">
            <SidebarGroupLabel className="text-sm">Projects</SidebarGroupLabel>

            <div className="flex gap-2 items-center">
              <Button
                onClick={onClickCreateProject}
                size="sm"
                variant="ghost"
                className="opacity-0 group-hover/sidebar-label:opacity-100 transition-opacity"
              >
                <Plus className="size-4" />
              </Button>

              <ChevronRight className="size-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
            </div>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenu>
            {showLoadingState
              ? Array.from({ length: 3 }).map((_, index) => (
                  <SidebarMenuItem key={`project-loading-${index}`}>
                    <SidebarMenuSkeleton showIcon />
                  </SidebarMenuItem>
                ))
              : projectResources.map((item) => {
                  const isActive = activeProjectId === item.id;

                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        className={cn(
                          "hover:bg-sidebar-accent hover:text-sidebar-primary",
                          isActive &&
                            "border border-primary/30 ring-2 ring-primary/25",
                        )}
                      >
                        <Link
                          href={getProjectHref(item.id)}
                          onClick={() => setSelectedProjectId(item.id)}
                          onKeyDown={(event) => {
                            if (
                              event.key === "Delete" ||
                              event.key === "Backspace"
                            ) {
                              event.preventDefault();
                              requestDeleteProject(item.id);
                            }
                          }}
                        >
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
                          <DropdownMenuItem
                            onClick={() => handleEditProject(item)}
                          >
                            <Edit />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleOpenProject(item.id)}
                          >
                            <Folder className="text-muted-foreground" />
                            <span>View Project</span>
                            <DropdownMenuShortcut>Enter</DropdownMenuShortcut>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Share className="text-muted-foreground" />
                            <span>Share Project</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => requestDeleteProject(item.id)}
                          >
                            <Trash2 className="text-muted-foreground" />
                            <span>Delete Project</span>
                            <DropdownMenuShortcut>Del</DropdownMenuShortcut>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </SidebarMenuItem>
                  );
                })}

            {!showLoadingState && projectResources.length > 0 && (
              <SidebarMenuItem>
                <SidebarMenuButton
                  className="text-sidebar-foreground/70  hover:bg-sidebar-accent
  hover:text-sidebar-primary"
                >
                  <MoreHorizontal />
                  <Link href={"/projects"}>
                    {" "}
                    <span>More</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </CollapsibleContent>
      </SidebarGroup>
      <DeleteAlertDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        onConfirm={handleDeleteSelectedProject}
        title="Delete selected project?"
        description={`"${selectedProject?.title ?? "This project"}" will be permanently deleted.`}
        confirmLabel="Delete project"
      />
    </Collapsible>
  );
}
