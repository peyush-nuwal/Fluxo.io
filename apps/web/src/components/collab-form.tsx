"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  AlertTriangle,
  ChevronDown,
  MoreHorizontal,
  Send,
  Trash2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useUser } from "@/hooks/use-user";
import {
  addCollaborators,
  deleteCollaborator,
  getCollaborators,
} from "@/lib/collab/client";
import { Spinner } from "./ui/spinner";
import { toast } from "sonner";
import { Span } from "next/dist/trace";

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
  const [pendingRemoval, setPendingRemoval] =
    useState<CollaboratorMember | null>(null);
  const [removingEmail, setRemovingEmail] = useState<string | null>(null);
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

  const requestCollaboratorRemoval = (member: CollaboratorMember) => {
    if (!canManageCollaborators || member.role === "owner") return;
    setPendingRemoval(member);
  };

  const handleCollaboratorRemoval = async () => {
    if (!pendingRemoval?.email || pendingRemoval.role === "owner") {
      setPendingRemoval(null);
      return;
    }

    const email = pendingRemoval.email;

    setRemovingEmail(email.toLowerCase());

    try {
      const res = (await deleteCollaborator(projectId, email)) as {
        success?: boolean;
        message?: string;
      };

      if (res?.success === false) {
        throw new Error(res?.message || "Failed to remove collaborator.");
      }

      toast.success(`${email} removed from this project.`);

      try {
        await reloadCollaborators();
      } catch {
        // Deletion succeeded; keep UX successful even if immediate refresh fails.
      }
    } catch (error: any) {
      toast.error(
        String(
          error?.data?.message ||
            error?.message ||
            "Failed to remove collaborator.",
        ),
      );
    } finally {
      setPendingRemoval(null);
      setRemovingEmail(null);
    }
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
          ) : collaboratorsWithYouFlag.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border/70 bg-muted/30 px-3 py-4 text-sm text-muted-foreground">
              No collaborators yet.
            </p>
          ) : (
            collaboratorsWithYouFlag.map((member) => (
              <ProjectMemberCard
                key={`${member.role}-${member.email ?? member.user_name ?? "owner"}`}
                email={member.email}
                displayEmail={member.email}
                userName={
                  member.user_name ??
                  (member.email ? member.email.split("@")[0] : "Owner")
                }
                avatarUrl={member.avatar_url ?? ""}
                role={member.role}
                isYou={member.isYou}
                canManageCollaborators={canManageCollaborators}
                isRemoving={
                  Boolean(member.email) &&
                  removingEmail === member.email?.toLowerCase()
                }
                onRequestRemove={() => requestCollaboratorRemoval(member)}
              />
            ))
          )}
        </div>
      </DialogContent>

      <AlertDialog
        open={Boolean(pendingRemoval)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen && !removingEmail) {
            setPendingRemoval(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove collaborator?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingRemoval?.email
                ? `This will immediately remove ${pendingRemoval.email} from this project.`
                : "This will immediately remove this collaborator from this project."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPendingRemoval(null)}
              disabled={Boolean(removingEmail)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleCollaboratorRemoval}
              disabled={Boolean(removingEmail)}
            >
              {removingEmail ? <Spinner /> : "Remove"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
};

export default CollabForm;

type UserCardProp = {
  email?: string | null;
  displayEmail?: string | null;
  userName: string;
  avatarUrl?: string;
  role?: "owner" | "collaborator";
  isYou?: boolean;
  canManageCollaborators?: boolean;
  isRemoving?: boolean;
  onRequestRemove?: () => void;
};

const ProjectMemberCard = ({
  displayEmail,
  userName,
  avatarUrl = "",
  role = "collaborator",
  isYou = false,
  isRemoving = false,
  onRequestRemove,
}: UserCardProp) => {
  return (
    <div className="group flex items-center gap-3  px-3 py-2.5 transition-colors hover:bg-muted/40">
      <Avatar className="h-9 w-9 items-center rounded-lg">
        <AvatarImage src={avatarUrl ?? ""} alt={userName} />
        <AvatarFallback className="rounded-lg">
          {userName?.[0] ?? "U"}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1 text-left group-data-[collapsible=icon]:hidden">
        <p className="truncate text-sm font-semibold leading-tight">
          {userName ?? ""}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {displayEmail || "No email available"}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {isYou ? (
          <span className="rounded-sm border border-primary/20 bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
            You
          </span>
        ) : null}
        {role === "owner" ? (
          <span
            className={cn(
              "rounded-sm border px-2 py-0.5 text-[11px] font-medium border-amber-200 bg-amber-50 text-amber-800",
            )}
          >
            Owner
          </span>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <div className=" rounded-sm border px-2 py-0.5 text-[11px] font-medium  border-sky-200 bg-sky-50 text-sky-800 ">
                {isRemoving ? (
                  <Spinner />
                ) : (
                  <span className="flex items-center gap-2">
                    Collaborator <ChevronDown strokeWidth={1} />
                  </span>
                )}
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              <DropdownMenuItem>
                <span>Collaborator </span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={onRequestRemove}>
                <Trash2 className="text-muted-foreground" />
                <span>Remove </span>
                <DropdownMenuShortcut>Del</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
};
