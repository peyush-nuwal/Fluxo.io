"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  resendEmailOtp,
  ResendOtpToEmailPayload,
  verifyOtp,
  VerifyEmailOtpPayload,
} from "@/lib/auth/client";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [isReady, setIsReady] = useState(false);

  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter the 6-digit code");
      return;
    }
    const email = searchParams.get("email");

    if (!email) {
      toast.error("Invalid verification link");
      return;
    }

    setIsSubmitting(true);
    const body: VerifyEmailOtpPayload = {
      email,
      otpCode: otp,
      purpose: "email_verification",
    };

    try {
      const result = await verifyOtp(body);

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success("Email verified successfully!");
      router.replace("/home");
    } catch {
      toast.error("Invalid or expired code");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    const email = searchParams.get("email");

    if (!email) {
      toast.error("Invalid verification link");
      return;
    }

    setIsSubmitting(true);

    try {
      const body: ResendOtpToEmailPayload = {
        email,
        purpose: "email_verification",
      };

      const result = await resendEmailOtp(body);

      // Expected errors → handled as data
      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success("Verification code sent to your email");
    } catch (err) {
      // Unexpected failures ONLY
      console.error("Resend OTP failed:", err);
      toast.error("Something went wrong. Please try again.");
    }
  };

  useEffect(() => {
    const email = searchParams.get("email");

    if (!email) {
      router.replace("/signup");
      return;
    }

    setIsReady(true);
  }, [searchParams, router]);

  if (!isReady) {
    return null;
  }

  return (
    <div className="px-6 py-4 flex items-center justify-center md:justify-between">
      {/* LEFT ART */}
      <div className="hidden lg:block relative h-[calc(100vh-40px)] w-[60%] overflow-hidden rounded-4xl border border-border shadow-lg shadow-muted">
        <Image
          src="/assets/art_2.png"
          alt="Verify email artwork"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* RIGHT CONTENT */}
      <div className="h-[calc(100vh-40px)] w-full lg:w-1/2 flex items-center justify-center">
        <div className="w-full max-w-md space-y-8 text-center">
          {/* HEADER */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold">Verify your email</h1>
            <p className="text-muted-foreground">
              {email ? (
                <>
                  We sent a 6-digit code to <br />
                  <span className="font-medium text-foreground">{email}</span>
                </>
              ) : (
                "Enter the 6-digit code sent to your email"
              )}
            </p>
          </div>

          {/* OTP INPUT */}
          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={setOtp}
              pattern={"[0-9]*"}
            >
              <InputOTPGroup className="gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <InputOTPSlot
                    key={i}
                    index={i}
                    className="h-12 w-12 text-lg rounded-lg shadow-none! border border-border border-solid"
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>

          {/* VERIFY BUTTON */}
          <Button
            onClick={handleVerify}
            disabled={isSubmitting}
            className="w-full h-10"
          >
            {isSubmitting ? "Verifying..." : "Verify email"}
          </Button>

          {/* RESEND */}
          <p className="text-sm text-muted-foreground">
            Didn’t receive the code?{" "}
            <button
              type="button"
              className="font-medium text-primary hover:underline"
              onClick={handleResendOtp}
            >
              Resend
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
