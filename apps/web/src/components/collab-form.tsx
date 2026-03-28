"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Dispatch,
  KeyboardEvent,
  SetStateAction,
  useMemo,
  useEffect,
  useState,
} from "react";
import { Field, FieldError, FieldLabel, FieldTitle } from "./ui/field";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";
import { AlertTriangle, Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useUser } from "@/hooks/use-user";
import { addCollaborators, getCollaborators } from "@/lib/collab/client";
import { Spinner } from "./ui/spinner";
import { toast } from "sonner";

type CollabFormProp = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  projectId: string;
};

type InviteTagType = "make" | "route" | "review" | "design" | "ship";

type Invitee = {
  email: string;
  tagType: InviteTagType;
};

type CollaboratorMember = {
  email: string | null;
  user_name: string | null;
  avatar_url: string | null;
  role: "owner" | "collaborator";
};
type CollaboratorsResponse = {
  success?: boolean;
  message?: string;
  data?: {
    members?: CollaboratorMember[];
    viewerRole?: "owner" | "collaborator";
  };
};

const TAG_META: Record<InviteTagType, { className: string }> = {
  make: {
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  route: {
    className: "border-sky-200 bg-sky-50 text-sky-800",
  },
  review: {
    className: "border-amber-200 bg-amber-50 text-amber-800",
  },
  design: {
    className: "border-pink-200 bg-pink-50 text-pink-800",
  },
  ship: {
    className: "border-violet-200 bg-violet-50 text-violet-800",
  },
};

const TAG_TYPES = Object.keys(TAG_META) as InviteTagType[];

const getRandomTagType = (): InviteTagType =>
  TAG_TYPES[Math.floor(Math.random() * TAG_TYPES.length)];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const splitEmails = (value: string) =>
  value
    .split(/[,\n;]+/)
    .map((item) => item.trim())
    .filter(Boolean);

const useProjectCollaborators = (projectId: string, open: boolean) => {
  const [collaborators, setCollaborators] = useState<CollaboratorMember[]>([]);
  const [isLoadingCollaborators, setIsLoadingCollaborators] = useState(false);
  const [collaboratorsError, setCollaboratorsError] = useState<string>("");
  const [viewerRole, setViewerRole] = useState<"owner" | "collaborator">(
    "collaborator",
  );

  const loadCollaborators = async () => {
    if (!projectId) return;
    setIsLoadingCollaborators(true);
    setCollaboratorsError("");

    try {
      const response = (await getCollaborators(
        projectId,
      )) as CollaboratorsResponse;
      const members = Array.isArray(response?.data?.members)
        ? response.data.members
        : [];
      setCollaborators(members);
      setViewerRole(
        response?.data?.viewerRole === "owner" ? "owner" : "collaborator",
      );
    } catch (error: any) {
      setCollaborators([]);
      setViewerRole("collaborator");
      setCollaboratorsError(
        String(
          error?.data?.message || error?.message || "Failed to load members.",
        ),
      );
    } finally {
      setIsLoadingCollaborators(false);
    }
  };

  useEffect(() => {
    if (!open || !projectId) return;
    void loadCollaborators();
  }, [open, projectId]);

  return {
    collaborators,
    isLoadingCollaborators,
    collaboratorsError,
    viewerRole,
    reloadCollaborators: loadCollaborators,
  };
};

const CollabForm = ({ open, setOpen, projectId }: CollabFormProp) => {
  const { user, loading } = useUser();
  const [invitees, setInvitees] = useState<Invitee[]>([]);
  const [currentEmail, setCurrentEmail] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");
  const [isSendingInvites, setIsSendingInvites] = useState(false);
  const {
    collaborators,
    isLoadingCollaborators,
    collaboratorsError,
    viewerRole,
    reloadCollaborators,
  } = useProjectCollaborators(projectId, open);

  const pushInvitees = (value: string) => {
    const emails = splitEmails(value);
    if (!emails.length) return 0;

    const existingEmails = new Set(
      invitees.map((invitee) => invitee.email.toLowerCase()),
    );
    const nextInvitees: Invitee[] = [];
    const invalidEmails: string[] = [];

    for (const email of emails) {
      if (!EMAIL_REGEX.test(email)) {
        invalidEmails.push(email);
        continue;
      }

      const normalizedEmail = email.toLowerCase();
      if (existingEmails.has(normalizedEmail)) continue;
      existingEmails.add(normalizedEmail);

      nextInvitees.push({ email, tagType: getRandomTagType() });
    }

    if (nextInvitees.length > 0) {
      setInvitees((prev) => [...prev, ...nextInvitees]);
      setCurrentEmail("");
    }

    if (invalidEmails.length > 0) {
      setEmailError(`Invalid email: ${invalidEmails[0]}`);
    } else {
      setEmailError("");
    }

    return nextInvitees.length;
  };

  const onInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "," || event.key === "Enter" || event.key === "Tab") {
      event.preventDefault();
      pushInvitees(currentEmail);
      return;
    }

    if (
      event.key === "Backspace" &&
      !currentEmail.trim() &&
      invitees.length > 0
    ) {
      setInvitees((prev) => prev.slice(0, -1));
    }
  };

  const canManageCollaborators = viewerRole === "owner";
  const currentUserEmail = (user?.email || "").trim().toLowerCase();
  const collaboratorsWithYouFlag = useMemo(
    () =>
      collaborators.map((member) => ({
        ...member,
        isYou:
          typeof member.email === "string" &&
          member.email.toLowerCase() === currentUserEmail,
      })),
    [collaborators, currentUserEmail],
  );

  const sendCollabInvite = async () => {
    if (!canManageCollaborators || isSendingInvites) return;

    const typedEmail = currentEmail.trim();
    const pendingFromInput = typedEmail
      ? splitEmails(typedEmail)
          .filter((email) => EMAIL_REGEX.test(email))
          .map((email) => ({
            email,
            tagType: getRandomTagType() as InviteTagType,
          }))
      : [];

    const pending: Invitee[] = [...invitees];
    const seen = new Set(pending.map((invitee) => invitee.email.toLowerCase()));
    for (const invitee of pendingFromInput) {
      const normalizedEmail = invitee.email.toLowerCase();
      if (seen.has(normalizedEmail)) continue;
      seen.add(normalizedEmail);
      pending.push(invitee);
    }

    if (!pending.length) {
      setEmailError("Add at least one email to send an invite.");
      return;
    }

    setIsSendingInvites(true);
    setEmailError("");

    const successfulEmails = new Set<string>();
    let failedCount = 0;

    for (const invitee of pending) {
      try {
        const res = (await addCollaborators(projectId, invitee.email)) as {
          success?: boolean;
          message?: string;
        };

        if (res?.success === false) {
          failedCount += 1;
          continue;
        }

        successfulEmails.add(invitee.email.toLowerCase());
      } catch {
        failedCount += 1;
      }
    }

    const successCount = successfulEmails.size;

    if (successCount > 0) {
      toast.success(
        `${successCount} invitation${successCount > 1 ? "s" : ""} sent successfully.`,
      );
      setInvitees((prev) =>
        prev.filter(
          (invitee) => !successfulEmails.has(invitee.email.toLowerCase()),
        ),
      );
      if (typedEmail) {
        setCurrentEmail("");
      }
      await reloadCollaborators();
    }

    if (failedCount > 0) {
      toast.error(
        `Failed to send ${failedCount} invitation${failedCount > 1 ? "s" : ""}.`,
      );
    }

    setIsSendingInvites(false);
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite a Team to Collaborate</DialogTitle>
          <DialogDescription>
            Team can edit, view, or provide feedback on this Project
          </DialogDescription>
        </DialogHeader>

        {canManageCollaborators ? (
          <>
            <Field>
              <FieldLabel htmlFor="email">Email Address</FieldLabel>
              <div className="flex gap-3">
                <div className="flex min-h-10 w-full flex-wrap items-center gap-2 rounded-md border border-input bg-transparent px-3 py-2">
                  {invitees.map((invitee, index) => (
                    <Badge
                      key={`${invitee.email}-${index}`}
                      variant="outline"
                      className={cn(
                        "gap-2 border px-2 py-0.5",
                        TAG_META[invitee.tagType].className,
                      )}
                    >
                      <span className="text-sm font-medium">
                        {invitee.email}
                      </span>
                      <button
                        type="button"
                        aria-label={`Remove ${invitee.email}`}
                        onClick={() =>
                          setInvitees((prev) =>
                            prev.filter((_, i) => i !== index),
                          )
                        }
                        className="rounded px-1 text-sm hover:bg-black/10"
                      >
                        x
                      </button>
                    </Badge>
                  ))}
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={currentEmail}
                    placeholder="name@company.com"
                    onChange={(e) => {
                      setCurrentEmail(e.target.value);
                      if (emailError) setEmailError("");
                    }}
                    onPaste={(event) => {
                      const pastedText = event.clipboardData.getData("text");
                      if (!pastedText) return;
                      event.preventDefault();
                      pushInvitees(pastedText);
                    }}
                    onKeyDown={onInputKeyDown}
                    className="h-8 min-w-44 flex-1 border-0 bg-transparent px-0 py-0 shadow-none focus-visible:ring-0"
                  />
                </div>
                <Button
                  type="button"
                  onClick={sendCollabInvite}
                  disabled={isSendingInvites}
                >
                  {isSendingInvites ? <Spinner /> : <Send />} Send Invites
                </Button>
              </div>
              <FieldError className="mt-1">{emailError}</FieldError>
            </Field>
          </>
        ) : (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-3 text-amber-900"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="text-sm font-medium">
              Only the project owner can invite or remove collaborators.
            </p>
          </div>
        )}

        <div>
          <FieldTitle className="mb-3 mt-5 text-base">
            Project Members
          </FieldTitle>

          {loading || isLoadingCollaborators ? (
            <div className="flex justify-center items-center gap-2">
              Loading Members <Spinner />
            </div>
          ) : collaboratorsError ? (
            <p className="text-sm text-destructive">{collaboratorsError}</p>
          ) : (
            collaboratorsWithYouFlag.map((member) => (
              <ProjectMemberCard
                key={`${member.role}-${member.email ?? member.user_name ?? "owner"}`}
                userName={
                  member.user_name ??
                  (member.email ? member.email.split("@")[0] : "Owner")
                }
                avatarUrl={member.avatar_url ?? ""}
                role={member.role}
                isYou={member.isYou}
              />
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CollabForm;

type UserCardProp = {
  userName: string;
  avatarUrl?: string;
  role?: "owner" | "collaborator";
  isYou?: boolean;
};

const ProjectMemberCard = ({
  userName,
  avatarUrl = "",
  role = "collaborator",
  isYou = false,
}: UserCardProp) => {
  return (
    <div className="flex items-center justify-center gap-3 px-2 py-2">
      <Avatar className="h-8 w-8 items-center rounded-lg">
        <AvatarImage src={avatarUrl ?? ""} alt={userName} />
        <AvatarFallback className="rounded-lg">
          {userName?.[0] ?? "U"}
        </AvatarFallback>
      </Avatar>
      <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
        <span className="truncate font-medium">{userName ?? ""}</span>
      </div>
      <div className="flex items-center gap-2">
        {isYou ? <span className="text-primary text-xs">You</span> : null}
        <span className="rounded-lg border border-border border-solid bg-secondary px-2 py-1 text-sm">
          {role === "owner" ? "Owner" : "Collaborator"}
        </span>
      </div>
    </div>
  );
};
