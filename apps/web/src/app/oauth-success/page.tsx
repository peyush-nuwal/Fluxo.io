"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { toast } from "sonner";
import { onAuthSuccess } from "@/lib/auth/client";
import Image from "next/image";
import { motion } from "motion/react";
import { Check } from "lucide-react";

export default function OAuthSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      toast.error("OAuth failed. Please try again.");
      router.replace("/login");
      return;
    }

    document.cookie = `access_token=${token}; Path=/; SameSite=Lax`;
    document.cookie = `refresh_token=${token}; Path=/; SameSite=Lax`;

    onAuthSuccess();

    const t = setTimeout(() => {
      router.replace("/home");
    }, 1200);

    return () => clearTimeout(t);
  }, [router, searchParams]);

  return (
    <div className="h-screen w-full flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-10">
        {/* FLOW */}
        <div className="flex items-center gap-6">
          {/* Google */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="h-14 w-14 rounded-xl border border-border bg-background flex items-center justify-center"
          >
            <Image
              src="/assets/google.svg"
              alt="Google"
              width={28}
              height={28}
            />
          </motion.div>

          {/* Connection */}
          <div className="relative w-20 h-[2px] bg-muted overflow-hidden rounded">
            <motion.div
              className="absolute left-0 top-0 h-full w-6 bg-primary"
              animate={{ x: ["-24px", "80px"] }}
              transition={{
                duration: 0.9,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>

          {/* App */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="h-14 w-14 rounded-xl border border-border bg-background flex items-center justify-center"
          >
            <Image src="/assets/logo.svg" width={25} height={25} alt="loo" />
          </motion.div>
        </div>

        {/* STATUS */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center space-y-2"
        >
          <p className="text-sm font-medium">Authenticating</p>
          <p className="text-xs text-muted-foreground">
            Establishing secure connection
          </p>
        </motion.div>

        {/* SUCCESS */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1.4, type: "spring" }}
          className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center"
        >
          <Check className="h-5 w-5 text-primary" />
        </motion.div>
      </div>
    </div>
  );
}
