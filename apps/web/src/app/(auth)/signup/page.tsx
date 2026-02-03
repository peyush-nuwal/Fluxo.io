"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { onAuthSuccess, signup } from "@/lib/auth/client";
import { toast } from "sonner";
import PasswordInput from "@/components/password-input";
import PasswordStrengthChecker from "@/components/password-strength-checker";

export default function SignupPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [password, setPassword] = useState("");
  const [isStrongPassword, setIsStrongPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const userName = formData.get("userName") as string;
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const result = await signup(userName, name, email, password);

    if (!result.ok) {
      if (result.details) {
        setErrors(result.details);
      } else {
        toast.error(result.message);
      }
      setIsSubmitting(false);
      return;
    }

    // ✅ success path ONLY when ok === true
    onAuthSuccess();
    toast.success("Sign up successfully!");
    router.replace(`/verify-email?email=${encodeURIComponent(email)}`);
  };

  return (
    <div className="px-6 py-4 flex items-center justify-center md:justify-between">
      {/* LEFT ART */}
      <div className="hidden lg:block relative h-[calc(100vh-40px)] w-[60%] overflow-hidden rounded-2xl border border-border shadow-lg shadow-muted">
        <Image
          src="/assets/art_2.png"
          alt="Signup artwork"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* RIGHT FORM */}
      <div className="h-[calc(100vh-40px)] w-full lg:w-1/2 flex items-center justify-center">
        <div className="w-full max-w-md space-y-6">
          {/* HEADER */}
          <div className="text-center space-y-2">
            <h1 className="text-5xl font-bold">Create account</h1>
            <h3 className="text-lg font-medium text-muted-foreground">
              Join Fluxo today
            </h3>
          </div>
          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* userName */}
            <div className="space-y-1">
              <Input
                name="userName"
                type="text"
                placeholder="User Name"
                required
                className="h-10"
              />
              {errors?.userName && (
                <p className="text-sm text-destructive">{errors.userName[0]}</p>
              )}
            </div>
            {/* name */}
            <div className="space-y-1">
              <Input
                name="name"
                type="text"
                placeholder="Full Name"
                required
                className="h-10"
              />
              {errors?.name && (
                <p className="text-sm text-destructive">{errors.name[0]}</p>
              )}
            </div>
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
            <div>
              <PasswordInput
                name="password"
                placeholder="Password"
                required
                error={errors?.password?.[0]}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {password.length > 0 && (
                <PasswordStrengthChecker
                  password={password}
                  onStrengthChange={setIsStrongPassword}
                />
              )}
            </div>

            {errors?._form && (
              <p className="text-sm text-destructive text-center">
                {errors._form[0]}
              </p>
            )}

            <Button
              type="submit"
              disabled={isSubmitting || !isStrongPassword}
              className="w-full h-10 disabled:opacity-50"
            >
              {isSubmitting ? "Setting things up..." : "Create account"}
            </Button>
          </form>
          <span className="text-sm text-muted-foreground text-center block ">
            {" "}
            OR{" "}
          </span>{" "}
          {/* O-auth btns */}{" "}
          <div className="flex items-center gap-3">
            {" "}
            <Button variant={"outline"} size={"lg"} className="h-10 flex-1">
              {" "}
              <Image
                src={"./assets/google.svg"}
                width={22}
                height={22}
                alt="google"
              />{" "}
              Google{" "}
            </Button>{" "}
            <Button variant={"outline"} size={"lg"} className="h-10 flex-1">
              {" "}
              <Image
                src={"./assets/github.svg"}
                width={22}
                height={22}
                alt="google"
              />{" "}
              Github{" "}
            </Button>{" "}
          </div>{" "}
          {/* FOOTER */}
          <p className="text-base text-muted-foreground text-center">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
