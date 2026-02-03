"use client";
import PasswordInput from "@/components/password-input";
import PasswordStrengthChecker from "@/components/password-strength-checker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  forgotPassword,
  updatePassword,
  verifyPasswordResetOTP,
} from "@/lib/auth/password.client";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const page = () => {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isStrongPassword, setIsStrongPassword] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expiresIn, setExpiresIn] = useState<number | null>(null);
  const [otp, setOtp] = useState("");

  useEffect(() => {
    if (!expiresIn) return;

    const interval = setInterval(() => {
      setExpiresIn((prev) => {
        if (!prev || prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresIn]);

  const handleResendOtp = async () => {
    try {
      setLoading(true);
      const res = await forgotPassword(email);
      toast.success(res.message);
      handleOtpSentCount(res.expiresIn);
      setStep(2);
      setLoading(false);
    } catch (err: any) {
      toast.error(err?.error || "Failed to resend code");
      setLoading(false);
    }
  };

  const handleOtpSentCount = (expiresInFromBackend: number) => {
    setExpiresIn(expiresInFromBackend);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const verifyResetOtp = async () => {
    try {
      setLoading(true);
      const res = await verifyPasswordResetOTP({ email, otp });
      toast.success(res.message);
      setResetToken(res.resetToken || "");
      setStep(3);
    } catch (err: any) {
      toast.error(err?.error || "Failed to verify otp");
    } finally {
      setLoading(false);
    }
  };

  const updatePasswordHandler = async () => {
    try {
      setLoading(true);
      const res = await updatePassword({
        resetToken,
        newPassword: password,
      });
      toast.success(res.message);
      setLoading(false);
      router.replace("/login");
    } catch (err: any) {
      toast.error(err?.error || "Failed to update password");
      setLoading(false);
    }
  };

  return (
    <div className="px-6 py-4 flex items-center  justify-center md:justify-between">
      {/* LEFT ART */}
      <div className="hidden lg:block relative h-[calc(100vh-40px)] w-[50%] overflow-hidden rounded-2xl border border-border shadow-lg shadow-muted">
        <Image
          src="/assets/auth-ill.svg"
          alt="forgot password artwork"
          fill
          sizes="(min-width: 1024px) 60vw, 100vw"
          className="object-cover"
          priority
        />
      </div>

      {/* right ART */}
      <div className="relative h-[calc(100vh-40px)] w-full lg:w-[50%] overflow-hidden rounded-2xl p-5">
        {/* SLIDER */}
        <div
          className={cn(
            "flex h-full w-[300%] transition-transform duration-500 ease-in-out",
            step === 2 && "-translate-x-1/3",
            step === 3 && "-translate-x-2/3",
          )}
        >
          {/* STEP 1 */}
          <div className="w-1/2 flex items-center justify-center">
            <div className="max-w-lg flex flex-col gap-4">
              <h1 className="text-6xl font-bold">
                Forgot
                <br />
                Password?
              </h1>

              <p className="text-lg">
                Enter the email address associated with your account.
              </p>

              <div>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  className={cn(
                    "h-12",
                    error &&
                      "border-destructive focus-visible:ring-destructive",
                  )}
                />

                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>

              <Button
                size="lg"
                className="ml-auto mt-10 flex items-center gap-2"
                onClick={handleResendOtp}
                disabled={!email || loading}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {loading ? (
                    <motion.span
                      key="loading"
                      className="flex items-center gap-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending…
                    </motion.span>
                  ) : (
                    <motion.span
                      key="idle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      Next
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </div>
          </div>

          {/* STEP 2 */}
          <div className="w-1/2 flex items-center justify-center">
            <div className="max-w-lg flex flex-col gap-4">
              <h1 className="text-6xl font-bold">Verify</h1>

              <p className="text-lg">
                Check your email to continue password recovery.
              </p>

              {/* OTP INPUT */}
              <div className="flex  flex-col  items-center justify-center">
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

                {/* RESEND */}
                <p className="text-sm text-muted-foreground mt-4">
                  {expiresIn && expiresIn > 0 ? (
                    <>
                      Resend available in{" "}
                      <span className="font-medium">
                        {formatTime(expiresIn)}
                      </span>
                    </>
                  ) : (
                    <>
                      Didn’t receive the code?{" "}
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        className="font-medium text-primary hover:underline"
                      >
                        Resend
                      </button>
                    </>
                  )}
                </p>
              </div>

              <div className="flex justify-between items-center mt-10">
                <Button
                  onClick={() => setStep(1)}
                  size="lg"
                  variant={"ghost-primary"}
                  className="text-muted-foreground"
                >
                  Back
                </Button>
                <Button size="lg" onClick={verifyResetOtp}>
                  <AnimatePresence mode="wait" initial={false}>
                    {loading ? (
                      <motion.span
                        key="loading"
                        className="flex items-center gap-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <Loader2 className="h-4 w-4 animate-spin" />
                        verifying...
                      </motion.span>
                    ) : (
                      <motion.span
                        key="idle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        Verify
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Button>
              </div>
            </div>
          </div>

          {/* STEP 3 */}
          <div className="w-1/2 flex items-center justify-center">
            <div className="max-w-lg flex flex-col gap-4">
              <h1 className="text-6xl font-bold">Change Password</h1>

              <p className="text-lg">Enter a new password for your account.</p>

              <div className="flex flex-col">
                <PasswordInput
                  placeholder="New password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                {password && (
                  <PasswordStrengthChecker
                    password={password}
                    onStrengthChange={setIsStrongPassword}
                  />
                )}
              </div>

              {/* STEP 3 */}
              <div className="flex justify-between items-center mt-10">
                <Button
                  onClick={() => setStep(2)}
                  size="lg"
                  variant={"ghost-primary"}
                  className="text-muted-foreground"
                >
                  Back
                </Button>
                <Button
                  size="lg"
                  onClick={updatePasswordHandler}
                  disabled={!isStrongPassword}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {loading ? (
                      <motion.span
                        key="loading"
                        className="flex items-center gap-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <Loader2 className="h-4 w-4 animate-spin" />
                        verifying...
                      </motion.span>
                    ) : (
                      <motion.span
                        key="idle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        Verify
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
