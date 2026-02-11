"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useModalStore } from "@/store/useModalStore";
import { Input } from "./ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useProjectStore } from "@/store/projectsStore";
import { useActionState, useEffect, useState } from "react";
import { Textarea } from "./ui/textarea";
import { useDiagramStore } from "@/store/diagramsStore";
import { Button } from "./ui/button";
import { useFormStatus } from "react-dom";
import { useUser } from "@/hooks/use-user";

type CreateDiagramFormState = {
  success: boolean;
  error: string | null;
};

const initialFormState: CreateDiagramFormState = {
  success: false,
  error: null,
};

export default function CreateDiagramDialog() {
  const { modelType, close } = useModalStore();
  const { projects, loading, fetchProject } = useProjectStore();
  const createDiagram = useDiagramStore((s) => s.createDiagram);
  const { user } = useUser();
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const hasProjects = projects.length > 0;

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const [formState, formAction] = useActionState(
    async (_prevState: CreateDiagramFormState, formData: FormData) => {
      const name = String(formData.get("name") ?? "").trim();
      const description = String(formData.get("description") ?? "").trim();
      const projectId = String(formData.get("projectId") ?? "").trim();
      const ownerName = user?.name?.trim() || null;
      const ownerUsername =
        user?.user_name?.trim() ||
        user?.name?.trim() ||
        (user?.email ? String(user.email).split("@")[0] : null);
      const ownerAvatarUrl = user?.avatar_url?.trim() || null;

      const created = await createDiagram({
        name,
        description: description || null,
        projectId: projectId || null,
        owner_name: ownerName,
        owner_username: ownerUsername,
        owner_avatar_url: ownerAvatarUrl,
      });

      if (!created) {
        return { success: false, error: "Failed to create diagram." };
      }

      return { success: true, error: null };
    },
    initialFormState,
  );

  useEffect(() => {
    if (!formState.success) return;
    setSelectedProjectId("");
    close();
  }, [formState.success, close]);

  return (
    <Dialog open={modelType === "createDiagramDialog"} onOpenChange={close}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Diagram</DialogTitle>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <Field>
            <FieldLabel htmlFor="name">Diagram Name</FieldLabel>
            <Input id="name" name="name" placeholder="Untitled diagram" />
          </Field>

          <Field>
            <FieldLabel htmlFor="projectId">Project</FieldLabel>
            <Select
              value={selectedProjectId}
              onValueChange={setSelectedProjectId}
              disabled={loading || !hasProjects}
            >
              <SelectTrigger id="projectId" className="w-full ">
                <SelectValue
                  placeholder={
                    loading
                      ? "Loading projects..."
                      : hasProjects
                        ? "Select a Project"
                        : "No projects available"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Projects</SelectLabel>
                  {loading && (
                    <div className="px-2 py-2 text-sm text-muted-foreground">
                      Loading projects...
                    </div>
                  )}
                  {!loading && !hasProjects && (
                    <div className="px-2 py-2 text-sm text-muted-foreground">
                      No projects found
                    </div>
                  )}
                  {!loading &&
                    hasProjects &&
                    projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.title}
                      </SelectItem>
                    ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <input type="hidden" name="projectId" value={selectedProjectId} />
          </Field>

          <Field>
            <FieldLabel htmlFor="description">Description</FieldLabel>
            <Textarea
              id="description"
              name="description"
              placeholder="Write a short description (optional)"
              rows={6}
              className="min-h-32!"
            />
          </Field>

          {formState.error && (
            <p className="text-sm text-destructive">{formState.error}</p>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={close}>
              Cancel
            </Button>
            <SubmitButton />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Creating..." : "Create Diagram"}
    </Button>
  );
}
