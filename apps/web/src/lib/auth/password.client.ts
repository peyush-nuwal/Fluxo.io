"use client";

import { frontendApiPost } from "@/lib/frontend-api";
import type { ApiResponse } from "@/types/api";

interface VerifyPasswordResetOtpPayload {
  email: string;
  otp: string;
}

interface UpdatePasswordPayload {
  resetToken: string;
  newPassword: string;
}

interface ForgotPasswordData {
  expiresIn: number;
}

interface VerifyPasswordResetOtpData {
  resetToken: string;
}

interface PasswordClientResponse {
  message: string;
}

export async function forgotPassword(
  email: string,
): Promise<PasswordClientResponse & ForgotPasswordData> {
  const response = await frontendApiPost<ApiResponse<ForgotPasswordData>>(
    "/api/v1/auth/password/forgot-password",
    { email },
  );

  return {
    message: response.message,
    expiresIn: response.data.expiresIn,
  };
}

export async function verifyPasswordResetOTP({
  email,
  otp,
}: VerifyPasswordResetOtpPayload): Promise<
  PasswordClientResponse & VerifyPasswordResetOtpData
> {
  const response = await frontendApiPost<
    ApiResponse<VerifyPasswordResetOtpData>
  >("/api/v1/auth/password/verify-reset-password-otp", {
    email,
    otpCode: otp,
  });

  return {
    message: response.message,
    resetToken: response.data.resetToken,
  };
}

export async function updatePassword({
  resetToken,
  newPassword,
}: UpdatePasswordPayload): Promise<PasswordClientResponse> {
  const response = await frontendApiPost<ApiResponse<unknown>>(
    "/api/v1/auth/password/reset",
    {
      resetToken,
      newPassword,
    },
  );

  return {
    message: response.message,
  };
}
