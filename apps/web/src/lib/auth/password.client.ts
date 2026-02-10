"use client";

import { apiFetch } from "@/lib/api";

interface VerifyPasswordResetOtpPayload {
  email: string;
  otp: string;
}

interface UpdatePasswordPayload {
  resetToken: string;
  newPassword: string;
}

export async function forgotPassword(email: string) {
  return apiFetch("/api/v1/auth/password/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function verifyPasswordResetOTP({
  email,
  otp,
}: VerifyPasswordResetOtpPayload) {
  return apiFetch("/api/v1/auth/password/verify-reset-password-otp", {
    method: "POST",
    body: JSON.stringify({ email, otpCode: otp }),
  });
}

export async function updatePassword({
  resetToken,
  newPassword,
}: UpdatePasswordPayload) {
  return apiFetch("/api/v1/auth/password/reset", {
    method: "POST",
    body: JSON.stringify({ resetToken, newPassword }),
  });
}
