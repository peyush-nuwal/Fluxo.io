import { useModalStore } from "@/store/useModalStore";
import { useActionState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { useFormStatus } from "react-dom";
import { Input } from "./ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { useUser } from "@/hooks/use-user";
import { Textarea } from "./ui/textarea";
import { toast } from "sonner";
import { useProjectStore } from "@/store/projectsStore";
import { FileUpload } from "./file-upload";

type ProjectFormState = {
  success: boolean;
  error: string | null;
};

const initialFormState: ProjectFormState = {
  success: false,
  error: null,
};

const ProjectForm = () => {
  const { modelType, close, data } = useModalStore();
  const { user } = useUser();
  const { createProject, updateProject } = useProjectStore();
  const mode = data?.mode ?? "create";
  const project = data?.project;

  const [formState, formAction] = useActionState(
    async (_prevState: ProjectFormState, formData: FormData) => {
      const title = String(formData.get("title") ?? "").trim();
      const description = String(formData.get("description") ?? "").trim();
      const thumbnail = formData.get("thumbnail");
      const ownerName = user?.name?.trim() || null;
      const ownerUsername =
        user?.user_name?.trim() ||
        user?.name?.trim() ||
        (user?.email ? String(user.email).split("@")[0] : null);
      const ownerAvatarUrl = user?.avatar_url?.trim() || null;

      if (!title) {
        return {
          success: false,
          error: "Project title is required.",
        };
      }

      const payload = new FormData();
      payload.append("title", title);
      if (description) payload.append("description", description);
      if (ownerName) payload.append("owner_name", ownerName);
      if (ownerUsername) payload.append("owner_username", ownerUsername);
      if (ownerAvatarUrl) payload.append("owner_avatar_url", ownerAvatarUrl);
      if (thumbnail instanceof File && thumbnail.size > 0) {
        payload.append("thumbnail", thumbnail);
      }

      let result;
      if (mode === "edit" && project?.id) {
        result = await updateProject(project.id, payload);
      } else {
        result = await createProject(payload);
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
          (mode === "edit" ? "Project updated" : "Project created"),
      );

      return { success: true, error: null };
    },
    initialFormState,
  );

  useEffect(() => {
    if (!formState.success) return;
    close();
  }, [formState.success, close]);

  const formTitle =
    mode === "edit"
      ? `Edit ${project?.title ?? "Project"}`
      : "Create New Project";
  const formDescription =
    mode === "edit" ? "Modify the project details." : "Create a new Project.";
  return (
    <Dialog open={modelType === "ProjectForm"} onOpenChange={close}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{formTitle}</DialogTitle>
          <DialogDescription className="sr-only">
            {formDescription}
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <Field>
            <FieldLabel htmlFor="title">Project Name</FieldLabel>
            <Input
              id="title"
              name="title"
              placeholder="Untitled Project"
              defaultValue={mode == "edit" ? project.title : ""}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="description">Description</FieldLabel>
            <Textarea
              id="description"
              name="description"
              placeholder="Write a short description (optional)"
              rows={6}
              className="min-h-32!"
              defaultValue={mode === "edit" ? project?.description : ""}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="thumbnail">Thumbnail (optional)</FieldLabel>
            <FileUpload
              name="thumbnail"
              initialPreview={mode === "edit" ? project?.thumbnail_url : null}
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
};

export default ProjectForm;

function SubmitButton({ mode }: { mode: "create" | "edit" }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending
        ? mode === "edit"
          ? "Updating..."
          : "Creating..."
        : mode === "edit"
          ? "Update Project"
          : "Create Project"}
    </Button>
  );
}
