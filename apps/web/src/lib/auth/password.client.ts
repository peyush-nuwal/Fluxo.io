"use client";

interface verifyPasswordResetOTPInterface {
  email: string;
  otp: string;
}

interface updatePasswordInterface {
  resetToken: string;
  newPassword: string;
}
export async function forgotPassword(email: string) {
  const res = await fetch("/api/v1/auth/password/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw data;
  }

  return data;
}

export async function verifyPasswordResetOTP({
  email,
  otp,
}: verifyPasswordResetOTPInterface) {
  const res = await fetch("/api/v1/auth/password/verify-reset-password-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otpCode: otp }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw data;
  }

  return data;
}

export async function updatePassword({
  resetToken,
  newPassword,
}: updatePasswordInterface) {
  const res = await fetch("/api/v1/auth/password/reset", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resetToken, newPassword }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw data;
  }

  return data;
}
