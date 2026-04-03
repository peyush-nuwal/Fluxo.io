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
  useEffect,
  useMemo,
  useState,
} from "react";
import { Field, FieldError, FieldLabel, FieldTitle } from "./ui/field";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";
import { AlertTriangle, ChevronDown, Send, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useUser } from "@/hooks/use-user";
import {
  addCollaborators,
  deleteCollaborator,
  getCollaborators,
  getPendingInvites,
} from "@/lib/collab/client";
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

type PendingInviteMember = {
  email: string;
};

type CollaboratorsResponse = {
  success?: boolean;
  message?: string;
  data?: {
    members?: CollaboratorMember[];
    viewerRole?: "owner" | "collaborator";
  };
};

type PendingInvitesResponse = {
  success?: boolean;
  message?: string;
  data?: {
    pendingUsers?: PendingInviteMember[];
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
  const [collaboratorMembers, setCollaboratorMembers] = useState<
    CollaboratorMember[]
  >([]);
  const [pendingInviteMembers, setPendingInviteMembers] = useState<
    PendingInviteMember[]
  >([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [membersError, setMembersError] = useState<string>("");
  const [viewerRole, setViewerRole] = useState<"owner" | "collaborator">(
    "collaborator",
  );

  const loadMembersAndInvites = async () => {
    if (!projectId) return;
    setIsLoadingMembers(true);
    setMembersError("");

    try {
      const [membersResponse, pendingInvitesResponse] = (await Promise.all([
        getCollaborators(projectId),
        getPendingInvites(projectId),
      ])) as [CollaboratorsResponse, PendingInvitesResponse];

      const members = Array.isArray(membersResponse?.data?.members)
        ? membersResponse.data.members
        : [];
      setCollaboratorMembers(members);
      setViewerRole(
        membersResponse?.data?.viewerRole === "owner"
          ? "owner"
          : "collaborator",
      );

      const pendingUsers = Array.isArray(
        pendingInvitesResponse?.data?.pendingUsers,
      )
        ? pendingInvitesResponse.data.pendingUsers
        : [];
      setPendingInviteMembers(pendingUsers);
    } catch (error: any) {
      setCollaboratorMembers([]);
      setPendingInviteMembers([]);
      setViewerRole("collaborator");
      setMembersError(
        String(
          error?.data?.message || error?.message || "Failed to load members.",
        ),
      );
    } finally {
      setIsLoadingMembers(false);
    }
  };

  useEffect(() => {
    if (!open || !projectId) return;
    void loadMembersAndInvites();
  }, [open, projectId]);

  return {
    collaboratorMembers,
    pendingInviteMembers,
    isLoadingMembers,
    membersError,
    viewerRole,
    reloadMembersAndInvites: loadMembersAndInvites,
  };
};

const CollabForm = ({ open, setOpen, projectId }: CollabFormProp) => {
  const { user, loading } = useUser();
  const [draftInvitees, setDraftInvitees] = useState<Invitee[]>([]);
  const [inviteInputValue, setInviteInputValue] = useState<string>("");
  const [inviteInputError, setInviteInputError] = useState<string>("");
  const [isSendingInvites, setIsSendingInvites] = useState(false);
  const [collaboratorPendingRemoval, setCollaboratorPendingRemoval] =
    useState<CollaboratorMember | null>(null);
  const [activeRemovalEmail, setActiveRemovalEmail] = useState<string | null>(
    null,
  );

  const {
    collaboratorMembers,
    pendingInviteMembers,
    isLoadingMembers,
    membersError,
    viewerRole,
    reloadMembersAndInvites,
  } = useProjectCollaborators(projectId, open);

  const pushInvitees = (value: string) => {
    const emails = splitEmails(value);
    if (!emails.length) return 0;

    const existingEmails = new Set(
      draftInvitees.map((invitee) => invitee.email.toLowerCase()),
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
      setDraftInvitees((prev) => [...prev, ...nextInvitees]);
      setInviteInputValue("");
    }

    if (invalidEmails.length > 0) {
      setInviteInputError(`Invalid email: ${invalidEmails[0]}`);
    } else {
      setInviteInputError("");
    }

    return nextInvitees.length;
  };

  const onInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "," || event.key === "Enter" || event.key === "Tab") {
      event.preventDefault();
      pushInvitees(inviteInputValue);
      return;
    }

    if (
      event.key === "Backspace" &&
      !inviteInputValue.trim() &&
      draftInvitees.length > 0
    ) {
      setDraftInvitees((prev) => prev.slice(0, -1));
    }
  };

  const canManageCollaborators = viewerRole === "owner";
  const currentUserEmail = (user?.email || "").trim().toLowerCase();

  const collaboratorsWithYouFlag = useMemo(
    () =>
      collaboratorMembers.map((member) => ({
        ...member,
        isYou:
          typeof member.email === "string" &&
          member.email.toLowerCase() === currentUserEmail,
      })),
    [collaboratorMembers, currentUserEmail],
  );

  const sendInvites = async () => {
    if (!canManageCollaborators || isSendingInvites) return;

    const typedEmail = inviteInputValue.trim();
    const pendingFromInput = typedEmail
      ? splitEmails(typedEmail)
          .filter((email) => EMAIL_REGEX.test(email))
          .map((email) => ({
            email,
            tagType: getRandomTagType() as InviteTagType,
          }))
      : [];

    const inviteQueue: Invitee[] = [...draftInvitees];
    const seen = new Set(
      inviteQueue.map((invitee) => invitee.email.toLowerCase()),
    );

    for (const invitee of pendingFromInput) {
      const normalizedEmail = invitee.email.toLowerCase();
      if (seen.has(normalizedEmail)) continue;
      seen.add(normalizedEmail);
      inviteQueue.push(invitee);
    }

    if (!inviteQueue.length) {
      setInviteInputError("Add at least one email to send an invite.");
      return;
    }

    setIsSendingInvites(true);
    setInviteInputError("");

    const successfulEmails = new Set<string>();
    let failedCount = 0;

    for (const invitee of inviteQueue) {
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
      setDraftInvitees((prev) =>
        prev.filter(
          (invitee) => !successfulEmails.has(invitee.email.toLowerCase()),
        ),
      );
      if (typedEmail) {
        setInviteInputValue("");
      }
      await reloadMembersAndInvites();
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
    setCollaboratorPendingRemoval(member);
  };

  const handleCollaboratorRemoval = async () => {
    if (
      !collaboratorPendingRemoval?.email ||
      collaboratorPendingRemoval.role === "owner"
    ) {
      setCollaboratorPendingRemoval(null);
      return;
    }

    const email = collaboratorPendingRemoval.email;

    setActiveRemovalEmail(email.toLowerCase());

    try {
      const res = (await deleteCollaborator(projectId, email)) as {
        success?: boolean;
        message?: string;
      };

      if (res?.success === false) {
        throw new Error(res?.message || "Failed to remove collaborator.");
      }

      toast.success(`${email} removed from this project.`);
      await reloadMembersAndInvites();
    } catch (error: any) {
      toast.error(
        String(
          error?.data?.message ||
            error?.message ||
            "Failed to remove collaborator.",
        ),
      );
    } finally {
      setCollaboratorPendingRemoval(null);
      setActiveRemovalEmail(null);
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
          <Field>
            <FieldLabel htmlFor="email">Email Address</FieldLabel>
            <div className="flex gap-3">
              <div className="flex min-h-10 w-full flex-wrap items-center gap-2 rounded-md border border-input bg-transparent px-3 py-2">
                {draftInvitees.map((invitee, index) => (
                  <Badge
                    key={`${invitee.email}-${index}`}
                    variant="outline"
                    className={cn(
                      "gap-2 border px-2 py-0.5",
                      TAG_META[invitee.tagType].className,
                    )}
                  >
                    <span className="text-sm font-medium">{invitee.email}</span>
                    <button
                      type="button"
                      aria-label={`Remove ${invitee.email}`}
                      onClick={() =>
                        setDraftInvitees((prev) =>
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
                  value={inviteInputValue}
                  placeholder="name@company.com"
                  onChange={(e) => {
                    setInviteInputValue(e.target.value);
                    if (inviteInputError) setInviteInputError("");
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
                onClick={sendInvites}
                disabled={isSendingInvites}
              >
                {isSendingInvites ? <Spinner /> : <Send />} Send Invites
              </Button>
            </div>
            <FieldError className="mt-1">{inviteInputError}</FieldError>
          </Field>
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

        {loading || isLoadingMembers ? (
          <div className="flex items-center justify-center gap-2">
            <Spinner />
          </div>
        ) : (
          <>
            <div>
              <FieldTitle className="mb-3 mt-5 text-base">
                Project Members
              </FieldTitle>

              {membersError ? (
                <p className="text-sm text-destructive">{membersError}</p>
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
                    canRemove={
                      canManageCollaborators &&
                      member.role !== "owner" &&
                      Boolean(member.email) &&
                      !member.isYou
                    }
                    isRemoving={
                      Boolean(member.email) &&
                      activeRemovalEmail === member.email?.toLowerCase()
                    }
                    onRequestRemove={() => requestCollaboratorRemoval(member)}
                  />
                ))
              )}
            </div>
            <div>
              <FieldTitle className="mb-3 mt-5 text-base">
                Invited Members
              </FieldTitle>

              {membersError ? (
                <p className="text-sm text-destructive">{membersError}</p>
              ) : pendingInviteMembers.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border/70 bg-muted/30 px-3 py-4 text-sm text-muted-foreground">
                  No pending users yet.
                </p>
              ) : (
                pendingInviteMembers.map((invite) => (
                  <ProjectMemberCard
                    key={`pending-${invite.email}`}
                    email={invite.email}
                    displayEmail={invite.email}
                    userName={invite.email.split("@")[0]}
                    statusLabel="Pending"
                  />
                ))
              )}
            </div>
          </>
        )}
      </DialogContent>

      <AlertDialog
        open={Boolean(collaboratorPendingRemoval)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen && !activeRemovalEmail) {
            setCollaboratorPendingRemoval(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove collaborator?</AlertDialogTitle>
            <AlertDialogDescription>
              {collaboratorPendingRemoval?.email
                ? `This will immediately remove ${collaboratorPendingRemoval.email} from this project.`
                : "This will immediately remove this collaborator from this project."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCollaboratorPendingRemoval(null)}
              disabled={Boolean(activeRemovalEmail)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleCollaboratorRemoval}
              disabled={Boolean(activeRemovalEmail)}
            >
              {activeRemovalEmail ? <Spinner /> : "Remove"}
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
  statusLabel?: string;
  isYou?: boolean;
  canRemove?: boolean;
  isRemoving?: boolean;
  onRequestRemove?: () => void;
};

const ProjectMemberCard = ({
  displayEmail,
  userName,
  avatarUrl = "",
  role = "collaborator",
  statusLabel,
  isYou = false,
  canRemove = false,
  isRemoving = false,
  onRequestRemove,
}: UserCardProp) => {
  const memberLabel =
    statusLabel ?? (role === "owner" ? "Owner" : "Collaborator");

  return (
    <div className="group flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-muted/40">
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

        {canRemove ? (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <div className="rounded-sm border border-sky-200 bg-sky-50 px-2 py-0.5 text-[11px] font-medium text-sky-800">
                {isRemoving ? (
                  <Spinner />
                ) : (
                  <span className="flex items-center gap-2">
                    {memberLabel} <ChevronDown strokeWidth={1} />
                  </span>
                )}
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              <DropdownMenuItem>
                <span>{memberLabel}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={onRequestRemove}>
                <Trash2 className="text-muted-foreground" />
                <span>Remove</span>
                <DropdownMenuShortcut>Del</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <span
            className={cn(
              "rounded-sm border px-2 py-0.5 text-[11px] font-medium",
              memberLabel === "Owner"
                ? "border-amber-200 bg-amber-50 text-amber-800"
                : "border-sky-200 bg-sky-50 text-sky-800",
            )}
          >
            {memberLabel}
          </span>
        )}
      </div>
    </div>
  );
};
