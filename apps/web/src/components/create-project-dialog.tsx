import { useModalStore } from "@/store/useModalStore";

import React, { useActionState, useEffect } from "react";
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

type CreateProjectFormState = {
  success: boolean;
  error: string | null;
};

const initialFormState: CreateProjectFormState = {
  success: false,
  error: null,
};

const createProjectDialog = () => {
  const { modelType, close } = useModalStore();
  const { user } = useUser();
  const { createProject } = useProjectStore();

  const [formState, formAction] = useActionState(
    async (_prevState: CreateProjectFormState, formData: FormData) => {
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

      const created = await createProject(payload);

      if (!created) {
        toast.error("failed to create Project!");
        return {
          success: false,
          error: "Failed to create Project.",
        };
      }

      return { success: true, error: null };
    },
    initialFormState,
  );

  useEffect(() => {
    if (!formState.success) return;
    toast.success("Project created Successfully");
    close();
  }, [formState.success, close]);
  return (
    <Dialog open={modelType === "createProjectDialog"} onOpenChange={close}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription className="sr-only">
            Create a new project with optional thumbnail, title, and
            description.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <Field>
            <FieldLabel htmlFor="title">Project Name</FieldLabel>
            <Input id="title" name="title" placeholder="Untitled Project" />
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
          <Field>
            <FieldLabel htmlFor="thumbnail">Thumbnail (optional)</FieldLabel>
            <Input
              id="thumbnail"
              name="thumbnail"
              type="file"
              accept="image/*"
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
};

export default createProjectDialog;

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Creating..." : "Create Project"}
    </Button>
  );
}
