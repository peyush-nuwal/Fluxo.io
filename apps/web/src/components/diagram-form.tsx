"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { FileUpload } from "./file-upload";
type DiagramFormState = {
  success: boolean;
  error: string | null;
};

const initialFormState: DiagramFormState = {
  success: false,
  error: null,
};

export default function DiagramForm() {
  const { modelType, close, data } = useModalStore();
  const createProjectOpen = useModalStore((s) => s.open);
  const { projects, loading, fetchProject } = useProjectStore();
  const createDiagram = useDiagramStore((s) => s.createDiagram);
  const updateDiagram = useDiagramStore((s) => s.updateDiagram);
  const { user } = useUser();
  const mode = data?.mode ?? "create";
  const diagram = data?.diagram;
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const hasProjects = projects.length > 0;

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const [formState, formAction] = useActionState(
    async (_prevState: DiagramFormState, formData: FormData) => {
      const name = String(formData.get("name") ?? "").trim();
      const description = String(formData.get("description") ?? "").trim();
      const projectId = String(formData.get("projectId") ?? "").trim();
      const ownerName = user?.name?.trim() || null;

      const thumbnail = formData.get("thumbnail");

      const ownerUsername =
        user?.user_name?.trim() ||
        user?.name?.trim() ||
        (user?.email ? String(user.email).split("@")[0] : null);

      const ownerAvatarUrl = user?.avatar_url?.trim() || null;

      const payload = new FormData();

      payload.append("name", name);
      if (description) payload.append("description", description);
      if (projectId) payload.append("projectId", projectId);
      if (ownerName) payload.append("owner_name", ownerName);
      if (ownerUsername) payload.append("owner_username", ownerUsername);
      if (ownerAvatarUrl) payload.append("owner_avatar_url", ownerAvatarUrl);

      if (thumbnail instanceof File && thumbnail.size > 0) {
        payload.append("thumbnail", thumbnail);
      }

      let result;

      if (mode === "edit" && diagram?.id) {
        result = await updateDiagram(payload, diagram.id);
      } else {
        result = await createDiagram(payload);
      }

      if (!result.success) {
        toast.error(result?.message);
        return {
          success: false,
          error: result.message ?? "Operation failed",
        };
      }

      toast.success(
        result.message ??
          (mode === "edit" ? "Diagram updated" : "Diagram created"),
      );

      return { success: true, error: null };
    },
    initialFormState,
  );

  useEffect(() => {
    if (!formState.success) return;

    setSelectedProjectId("");
    close();
  }, [formState.success, close]);

  useEffect(() => {
    if (diagram?.project_id && projects.length) {
      setSelectedProjectId(diagram.project_id);
    }
  }, [diagram, projects]);

  const formTitle =
    mode === "edit"
      ? `Edit ${diagram?.name ?? "Diagram"}`
      : "Create New Diagram";
  const description =
    mode === "edit" ? "Modify the diagram details." : "Create a new diagram.";

  return (
    <Dialog open={modelType === "DiagramForm"} onOpenChange={close}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{formTitle}</DialogTitle>
          <DialogDescription className="sr-only">
            {description}
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <Field>
            <FieldLabel htmlFor="name">Diagram Name</FieldLabel>
            <Input
              id="name"
              name="name"
              defaultValue={mode === "edit" ? diagram?.name : ""}
              placeholder="Untitled diagram"
            />
          </Field>
          <div>
            <Field>
              <div className="flex justify-between items-center ">
                {" "}
                <FieldLabel htmlFor="projectId">Project</FieldLabel>
                <Button
                  onClick={() => createProjectOpen("ProjectForm")}
                  size={"sm"}
                  variant={"ghost-primary"}
                  className="w-fit"
                  type="button"
                >
                  <Plus />
                  Create Project
                </Button>
              </div>
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
          </div>
          <Field>
            <FieldLabel htmlFor="description">Description</FieldLabel>
            <Textarea
              id="description"
              name="description"
              placeholder="Write a short description (optional)"
              defaultValue={mode === "edit" ? diagram?.description : ""}
              rows={6}
              className="min-h-32!"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="thumbnail">Thumbnail (optional)</FieldLabel>
            <FileUpload
              name="thumbnail"
              initialPreview={mode === "edit" ? diagram?.thumbnail_url : null}
            />
          </Field>
          {formState.error && (
            <p className="text-sm text-destructive">{formState.error}</p>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={close}>
              Cancel
            </Button>
            <SubmitButton mode={mode} />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SubmitButton({ mode }: { mode: "create" | "edit" }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending
        ? mode === "edit"
          ? "Updating..."
          : "Creating..."
        : mode === "edit"
          ? "Update Diagram"
          : "Create Diagram"}
    </Button>
  );
}
