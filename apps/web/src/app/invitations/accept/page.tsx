"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";

type AcceptState = "idle" | "loading" | "success" | "error";

export default function AcceptInvitationPage() {
  const searchParams = useSearchParams();
  const token = useMemo(
    () => searchParams.get("token")?.trim() ?? "",
    [searchParams],
  );

  const [state, setState] = useState<AcceptState>("idle");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (!token) {
      setState("error");
      setMessage("Invitation token is missing.");
      return;
    }

    let active = true;

    const run = async () => {
      setState("loading");
      try {
        const data = await apiFetch("/api/v1/diagram/invitations/accept", {
          method: "POST",
          body: JSON.stringify({ token }),
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!active) return;

        setState("success");
        setMessage(
          String(data?.message || "Invitation accepted successfully."),
        );
      } catch (error: any) {
        if (!active) return;
        setState("error");
        const status = error?.status;
        const apiMessage = String(
          error?.data?.message || error?.message || "",
        ).trim();

        if (status === 401) {
          setMessage("Please login first, then open this invite link again.");
          return;
        }

        if (status === 403) {
          setMessage(
            apiMessage ||
              "This invitation belongs to another account. Login with the invited email.",
          );
          return;
        }

        setMessage(
          apiMessage || "Something went wrong while accepting invitation.",
        );
      }
    };

    void run();

    return () => {
      active = false;
    };
  }, [token]);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-xl items-center justify-center px-6">
      <div className="w-full space-y-4 rounded-xl border border-border bg-card p-6 text-center">
        <h1 className="text-2xl font-semibold">Project Invitation</h1>

        {state === "loading" ? (
          <p className="text-muted-foreground">Accepting your invitation...</p>
        ) : null}

        {state === "success" ? (
          <p className="text-green-600">{message}</p>
        ) : null}

        {state === "error" ? (
          <p className="text-destructive">{message}</p>
        ) : null}

        <div className="pt-2">
          <Button asChild>
            <Link href="/home">Go to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
