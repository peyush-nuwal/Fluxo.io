"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { motion } from "motion/react";
import { Check } from "lucide-react";
import { consumeAuthReturnTo, onAuthSuccess } from "@/lib/auth/client";

function resolveSafeReturnTo(returnTo: string | null): string {
  if (!returnTo) return "/home";
  const value = returnTo.trim();
  if (!value.startsWith("/") || value.startsWith("//")) return "/home";
  return value;
}

export default function OAuthSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      document.cookie = `access_token=${token}; Path=/; SameSite=Lax`;
    }

    onAuthSuccess();

    const nextFromQuery = resolveSafeReturnTo(searchParams.get("next"));
    const nextFromStorage = consumeAuthReturnTo();
    const nextPath = resolveSafeReturnTo(nextFromStorage || nextFromQuery);

    const timer = setTimeout(() => {
      router.replace(nextPath);
    }, 1200);

    return () => clearTimeout(timer);
  }, [router, searchParams]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(130%_120%_at_15%_10%,hsl(var(--primary)/0.16),transparent_48%),radial-gradient(100%_120%_at_85%_90%,hsl(var(--primary)/0.11),transparent_52%),linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--muted)/0.45)_100%)] px-6 py-10">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-8 h-72 w-72 rounded-full bg-primary/20 blur-3xl"
        animate={{ x: [0, 20, -14, 0], y: [0, 12, -8, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-primary/15 blur-3xl"
        animate={{ x: [0, -18, 10, 0], y: [0, -12, 9, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md rounded-3xl border border-border/70 bg-card/85 p-8 text-center shadow-[0_24px_90px_-35px_rgba(2,8,23,0.48)] backdrop-blur-xl"
      >
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
          OAuth Verification
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Authenticating
        </h1>

        <div className="mt-8 flex items-center justify-center gap-5">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-background"
          >
            <Image
              src="/assets/google.svg"
              alt="OAuth provider"
              width={26}
              height={26}
            />
          </motion.div>

          <div className="relative h-[2px] w-20 overflow-hidden rounded-full bg-muted">
            <motion.div
              className="absolute left-0 top-0 h-full w-6 rounded-full bg-primary"
              animate={{ x: ["-24px", "80px"] }}
              transition={{
                duration: 0.92,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>

          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.12 }}
            className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-background"
          >
            <Image src="/assets/logo.svg" width={24} height={24} alt="Fluxo" />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.45, 1, 0.45] }}
          transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut" }}
          className="mt-7 text-sm text-muted-foreground"
        >
          Establishing secure session
        </motion.div>

        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            delay: 0.75,
            type: "spring",
            stiffness: 240,
            damping: 17,
          }}
          className="mx-auto mt-7 flex h-10 w-10 items-center justify-center rounded-full bg-primary/12"
        >
          <Check className="h-5 w-5 text-primary" />
        </motion.div>
      </motion.div>
    </div>
  );
}
