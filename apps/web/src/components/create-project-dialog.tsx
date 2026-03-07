import { useModalStore } from "@/store/useModalStore";

import React, { useActionState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { useFormStatus } from "react-dom";
import { Input } from "./ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { useUser } from "@/hooks/use-user";
import { Textarea } from "./ui/textarea";
import { createProject } from "@/lib/projects/client";
import { toast } from "sonner";

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

  const [formState, formAction] = useActionState(
    async (_prevState: CreateProjectFormState, formData: FormData) => {
      const title = String(formData.get("name") ?? "").trim();
      const description = String(formData.get("description") ?? "").trim();
      const ownerName = user?.name?.trim() || null;
      const ownerUsername =
        user?.user_name?.trim() ||
        user?.name?.trim() ||
        (user?.email ? String(user.email).split("@")[0] : null);
      const ownerAvatarUrl = user?.avatar_url?.trim() || null;
      const created = await createProject({
        title,
        description: description || null,
        owner_name: ownerName,
        owner_username: ownerUsername,
        owner_avatar_url: ownerAvatarUrl,
      });

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
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <Field>
            <FieldLabel htmlFor="name">Project Name</FieldLabel>
            <Input id="name" name="name" placeholder="Untitled Project" />
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
};

export default createProjectDialog;

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Creating..." : "Create Diagram"}
    </Button>
  );
}
