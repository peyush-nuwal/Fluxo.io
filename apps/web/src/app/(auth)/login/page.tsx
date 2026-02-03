"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { login, onAuthSuccess, startOAuth } from "@/lib/auth/client";
import PasswordInput from "@/components/password-input";

export default function LoginPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      await login(email, password);
      onAuthSuccess();
      toast.success("Logged in successfully!");
      router.replace("/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);

      if (error?.details) {
        setErrors(error.details);
      } else {
        toast.error(error?.message || "Login failed");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const goToForgotPassword = () => {
    router.replace("/forgot-password");
  };

  return (
    <div className="px-6 py-4 flex items-center justify-center md:justify-between">
      {/* LEFT ART */}
      <div className="hidden lg:block relative h-[calc(100vh-40px)] w-[60%] overflow-hidden rounded-2xl border border-border shadow-lg shadow-muted">
        <Image
          src="/assets/art.png"
          alt="Login artwork"
          fill
          sizes="(min-width: 1024px) 60vw, 100vw"
          className="object-cover"
          priority
        />
      </div>

      {/* RIGHT FORM */}
      <div className="h-[calc(100vh-40px)] w-full lg:w-1/2 flex items-center justify-center">
        <div className="w-full max-w-md space-y-6">
          {/* HEADER */}
          <div className="text-center space-y-2">
            <h1 className="text-5xl font-bold">Hi Developers</h1>
            <h3 className="text-lg font-medium text-muted-foreground">
              Welcome to Fluxo
            </h3>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1">
              <Input
                name="email"
                type="email"
                placeholder="Email"
                required
                className="h-10"
              />
              {errors?.email && (
                <p className="text-sm text-destructive">{errors.email[0]}</p>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col">
              <PasswordInput
                name="password"
                placeholder="Password"
                required
                error={errors?.password?.[0]}
              />

              <button
                onClick={goToForgotPassword}
                type="button"
                className="ml-auto w-fit inline-block my-2 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                Forgot password?
              </button>
            </div>

            {errors?._form && (
              <p className="text-sm text-destructive text-center">
                {errors._form[0]}
              </p>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-10 disabled:opacity-50"
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </Button>
          </form>

          <span className="text-sm text-muted-foreground text-center block">
            OR
          </span>

          {/* OAuth buttons */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="lg"
              className="h-10 flex-1"
              onClick={() => startOAuth("google")}
            >
              <Image
                src="./assets/google.svg"
                width={22}
                height={22}
                alt="google"
              />
              Google
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-10 flex-1"
              onClick={() => startOAuth("github")}
            >
              <Image
                src="./assets/github.svg"
                width={22}
                height={22}
                alt="github"
              />
              Github
            </Button>
          </div>

          <p className="text-base text-muted-foreground text-center">
            Don't have an Account?{" "}
            <Link
              href="/signup"
              className="font-medium text-primary hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
