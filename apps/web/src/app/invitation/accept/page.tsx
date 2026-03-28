"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, Loader2, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";

type AcceptState = "loading" | "success" | "error";

type ErrorView = {
  title: string;
  message: string;
  actionLabel: string;
  actionHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
};

function getText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function getErrorMessage(status: number | undefined, error: any): ErrorView {
  const rawMessage =
    getText(error?.data?.message) || getText(error?.message) || "";
  const normalizedMessage = rawMessage.toLowerCase();

  if (status === 401) {
    return {
      title: "Sign in required",
      message:
        "Please sign in with the invited email address, then open this invitation link again.",
      actionLabel: "Go to Login",
      actionHref: "/login",
      secondaryLabel: "Back to Home",
      secondaryHref: "/home",
    };
  }

  if (status === 403) {
    const wrongAccount =
      normalizedMessage.includes("not for you") ||
      normalizedMessage.includes("different account") ||
      normalizedMessage.includes("another account") ||
      normalizedMessage.includes("invited") ||
      normalizedMessage.includes("mismatch");

    if (wrongAccount) {
      return {
        title: "Invitation linked to another account",
        message:
          "This invitation was sent to a different email address. Sign in with the invited account and try again.",
        actionLabel: "Switch Account",
        actionHref: "/login",
        secondaryLabel: "Back to Home",
        secondaryHref: "/home",
      };
    }

    return {
      title: "Invitation cannot be accepted",
      message:
        "You do not have permission to accept this invitation with the current account.",
      actionLabel: "Go to Login",
      actionHref: "/login",
      secondaryLabel: "Back to Home",
      secondaryHref: "/home",
    };
  }

  if (status === 404) {
    return {
      title: "Invitation not found",
      message:
        "This invitation link is invalid or no longer available. Ask the project owner for a new invite.",
      actionLabel: "Back to Home",
      actionHref: "/home",
    };
  }

  if (status === 409) {
    return {
      title: "Invitation already accepted",
      message: "This invitation has already been used.",
      actionLabel: "Go to Home",
      actionHref: "/home",
    };
  }

  if (status === 410) {
    return {
      title: "Invitation expired",
      message:
        "This invitation has expired. Ask the project owner to send a new one.",
      actionLabel: "Go to Home",
      actionHref: "/home",
    };
  }

  return {
    title: "Unable to accept invitation",
    message:
      rawMessage || "Something went wrong while processing this invitation.",
    actionLabel: "Back to Home",
    actionHref: "/home",
  };
}

export default function AcceptInvitationPage() {
  const searchParams = useSearchParams();
  const token = useMemo(
    () => searchParams.get("token")?.trim() ?? "",
    [searchParams],
  );

  const [state, setState] = useState<AcceptState>("loading");
  const [successMessage, setSuccessMessage] = useState(
    "Invitation accepted successfully.",
  );
  const [errorView, setErrorView] = useState<ErrorView>({
    title: "Unable to accept invitation",
    message: "Something went wrong while processing this invitation.",
    actionLabel: "Back to Home",
    actionHref: "/home",
  });

  useEffect(() => {
    if (!token) {
      setState("error");
      setErrorView({
        title: "Invalid invitation link",
        message:
          "The invitation token is missing. Please use the full link from your email.",
        actionLabel: "Back to Home",
        actionHref: "/home",
      });
      return;
    }

    let active = true;

    const acceptInvitation = async () => {
      setState("loading");
      try {
        const data = await apiFetch("/api/v1/invitations/accept", {
          method: "POST",
          body: JSON.stringify({ token }),
          headers: { "Content-Type": "application/json" },
        });

        if (!active) return;

        setState("success");
        setSuccessMessage(
          getText(data?.message) ||
            "Invitation accepted successfully. You can now access this project.",
        );
      } catch (error: any) {
        if (!active) return;

        setState("error");
        setErrorView(getErrorMessage(error?.status, error));
      }
    };

    void acceptInvitation();

    return () => {
      active = false;
    };
  }, [token]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(120%_130%_at_10%_10%,hsl(var(--primary)/0.17),transparent_45%),radial-gradient(90%_120%_at_90%_90%,hsl(var(--primary)/0.1),transparent_50%),linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--muted)/0.45)_100%)] px-6 py-10">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-20 top-4 h-72 w-72 rounded-full bg-primary/20 blur-3xl"
        animate={{ x: [0, 18, -10, 0], y: [0, 12, -8, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-primary/15 blur-3xl"
        animate={{ x: [0, -16, 12, 0], y: [0, -10, 10, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-xl rounded-3xl border border-border/70 bg-card/85 p-8 shadow-[0_24px_90px_-35px_rgba(2,8,23,0.48)] backdrop-blur-xl"
      >
        <p className="text-center text-xs uppercase tracking-[0.22em] text-muted-foreground">
          Fluxo Invite
        </p>
        <h1 className="mt-3 text-center text-3xl font-semibold tracking-tight">
          Join Workspace
        </h1>

        <div className="mt-9 min-h-[210px]">
          <AnimatePresence mode="wait">
            {state === "loading" && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex flex-col items-center text-center"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="rounded-2xl border border-border bg-background/90 p-3"
                >
                  <Loader2 className="h-6 w-6 text-primary" />
                </motion.div>
                <p className="mt-4 text-base font-medium">
                  Validating invitation
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Secure verification in progress.
                </p>
              </motion.div>
            )}

            {state === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 230, damping: 18 }}
                className="flex flex-col items-center text-center"
              >
                <motion.div
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    delay: 0.06,
                    type: "spring",
                    stiffness: 260,
                    damping: 16,
                  }}
                  className="rounded-2xl border border-primary/25 bg-primary/10 p-3"
                >
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                </motion.div>
                <p className="mt-4 text-base font-medium">
                  Invitation accepted
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {successMessage}
                </p>
              </motion.div>
            )}

            {state === "error" && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center text-center"
              >
                <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-3">
                  <ShieldAlert className="h-6 w-6 text-destructive" />
                </div>
                <p className="mt-4 text-base font-semibold">
                  {errorView.title}
                </p>
                <p className="mt-1 max-w-md text-sm text-muted-foreground">
                  {errorView.message}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
          {state === "error" ? (
            <>
              <Button asChild className="h-11 px-6">
                <Link href={errorView.actionHref}>{errorView.actionLabel}</Link>
              </Button>
              {errorView.secondaryHref && errorView.secondaryLabel && (
                <Button asChild variant="outline" className="h-11 px-6">
                  <Link href={errorView.secondaryHref}>
                    {errorView.secondaryLabel}
                  </Link>
                </Button>
              )}
            </>
          ) : (
            <Button asChild className="h-11 px-6">
              <Link href="/home">Go to Home</Link>
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
