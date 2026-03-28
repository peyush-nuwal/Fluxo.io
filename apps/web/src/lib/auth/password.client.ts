"use client";

import { frontendApiPost } from "@/lib/frontend-api";

interface VerifyPasswordResetOtpPayload {
  email: string;
  otp: string;
}

interface UpdatePasswordPayload {
  resetToken: string;
  newPassword: string;
}

export async function forgotPassword(email: string) {
  return frontendApiPost("/api/v1/auth/password/forgot-password", { email });
}

export async function verifyPasswordResetOTP({
  email,
  otp,
}: VerifyPasswordResetOtpPayload) {
  return frontendApiPost("/api/v1/auth/password/verify-reset-password-otp", {
    email,
    otpCode: otp,
  });
}

export async function updatePassword({
  resetToken,
  newPassword,
}: UpdatePasswordPayload) {
  return frontendApiPost("/api/v1/auth/password/reset", {
    resetToken,
    newPassword,
  });
}
