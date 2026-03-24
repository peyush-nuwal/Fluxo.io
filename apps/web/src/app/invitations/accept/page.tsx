"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

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
        const res = await fetch("/api/v1/invitations/accept", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        const data = await res.json().catch(() => ({}));
        if (!active) return;

        if (!res.ok) {
          setState("error");
          setMessage(
            String(
              data?.message || data?.error || "Failed to accept invitation.",
            ),
          );
          return;
        }

        setState("success");
        setMessage(
          String(data?.message || "Invitation accepted successfully."),
        );
      } catch {
        if (!active) return;
        setState("error");
        setMessage("Something went wrong while accepting invitation.");
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
