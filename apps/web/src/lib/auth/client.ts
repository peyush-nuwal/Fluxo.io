"use client";

import { ApiError } from "../api";
import { isRecord } from "../error-utils";
import { frontendApiGet, frontendApiPost } from "../frontend-api";

export type OAuthProvider = "google" | "github";
export interface User {
  id: string;
  name: string;
  user_name: string;
  email: string;
  avatar_url: string;
  email_verified: boolean;
}

const USER_CACHE_KEY = "user_cache";
const AUTH_RETURN_TO_KEY = "auth_return_to";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CachedUser {
  user: User;
  timestamp: number;
}

export interface VerifyEmailOtpPayload {
  email: string;
  otpCode: string;
  purpose: "email_verification";
}

export interface ResendOtpToEmailPayload {
  email: string;
  purpose: "email_verification";
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
/* ------------------ Utils ------------------ */

function isBrowser() {
  return typeof window !== "undefined";
}

function sanitizeReturnTo(returnTo?: string | null): string | null {
  if (!returnTo) return null;
  const value = returnTo.trim();
  if (!value.startsWith("/") || value.startsWith("//")) {
    return null;
  }
  return value;
}

type FieldErrors = Record<string, string[]>;

function getMessage(value: unknown): string | undefined {
  if (!value || typeof value !== "object") return undefined;
  const message = (value as Record<string, unknown>).message;
  return typeof message === "string" ? message : undefined;
}

function toErrorList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item ?? "").trim())
      .filter((item) => item.length > 0);
  }
  if (typeof value === "string") {
    const message = value.trim();
    return message ? [message] : [];
  }
  return [];
}

function setMappedError(
  target: FieldErrors,
  key: string,
  value: unknown,
): void {
  const messages = toErrorList(value);
  if (messages.length) {
    target[key] = messages;
  }
}

function normalizeErrorDetails(
  details: unknown,
  fallbackMessage?: string,
): FieldErrors {
  const normalized: FieldErrors = {};

  if (details && typeof details === "object") {
    const source = details as Record<string, unknown>;
    setMappedError(
      normalized,
      "username",
      source.username ?? source.userName ?? source.user_name,
    );
    setMappedError(normalized, "name", source.name);
    setMappedError(normalized, "email", source.email);
    setMappedError(normalized, "password", source.password);
    setMappedError(
      normalized,
      "_form",
      source._form ?? source.form ?? source.non_field_errors ?? source.detail,
    );
  } else if (Array.isArray(details) || typeof details === "string") {
    setMappedError(normalized, "_form", details);
  }

  if (!normalized._form?.length && fallbackMessage) {
    setMappedError(normalized, "_form", fallbackMessage);
  }

  return normalized;
}

/* ------------------ Auth ------------------ */

export async function login(email: string, password: string) {
  try {
    const data = await frontendApiPost("/api/v1/auth/signin", {
      email,
      password,
    });

    clearUserCache();
    return data;
  } catch (error: unknown) {
    const data = error instanceof ApiError ? error.data : error;
    const payload = data && typeof data === "object" ? data : {};
    const message =
      typeof (payload as Record<string, unknown>).message === "string"
        ? ((payload as Record<string, unknown>).message as string)
        : "Something went wrong. Please try again.";

    throw {
      ...payload,
      message,
      details: normalizeErrorDetails(
        (payload as Record<string, unknown>).details,
        message,
      ),
    };
  }
}

export async function signup(
  username: string,
  name: string,
  email: string,
  password: string,
) {
  try {
    const data = await frontendApiPost("/api/v1/auth/signup", {
      username,
      name,
      email,
      password,
    });

    clearUserCache();
    return { ok: true, data };
  } catch (error: unknown) {
    const data = error instanceof ApiError ? error.data : {};
    const payload = data && typeof data === "object" ? data : {};
    const message =
      typeof (payload as Record<string, unknown>).message === "string"
        ? ((payload as Record<string, unknown>).message as string)
        : "Signup failed";

    return {
      ok: false,
      message,
      details: normalizeErrorDetails(
        (payload as Record<string, unknown>).details,
        message,
      ),
    };
  }
}

export async function onLogout() {
  // clear client state
  localStorage.clear();
  sessionStorage.clear();
  clearUserCache();

  try {
    const data = await frontendApiPost<{ message?: string }>(
      "/api/v1/auth/logout",
    );
    return data?.message;
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      throw error.data;
    }
    throw error;
  }
}

export function startOAuth(provider: OAuthProvider) {
  if (!API_BASE_URL) {
    throw new Error("Missing env variable: NEXT_PUBLIC_API_BASE_URL");
  }

  window.location.href = `${API_BASE_URL}/api/v1/auth/oauth/${provider}`;
}

export function setAuthReturnTo(returnTo?: string | null) {
  if (!isBrowser()) return;
  const safeReturnTo = sanitizeReturnTo(returnTo);
  if (safeReturnTo) {
    sessionStorage.setItem(AUTH_RETURN_TO_KEY, safeReturnTo);
    return;
  }
  sessionStorage.removeItem(AUTH_RETURN_TO_KEY);
}

export function consumeAuthReturnTo(): string | null {
  if (!isBrowser()) return null;
  const value = sanitizeReturnTo(sessionStorage.getItem(AUTH_RETURN_TO_KEY));
  sessionStorage.removeItem(AUTH_RETURN_TO_KEY);
  return value;
}

// otp function

export async function verifyOtp(body: VerifyEmailOtpPayload) {
  try {
    await frontendApiPost("/api/v1/auth/otp/verify", body);
    clearUserCache();
    return { ok: true };
  } catch (error: unknown) {
    const data = error instanceof ApiError ? error.data : {};
    return {
      ok: false,
      message: getMessage(data),
    };
  }
}

export async function resendEmailOtp(body: ResendOtpToEmailPayload) {
  try {
    await frontendApiPost("/api/v1/auth/otp/generate", body);
    return { ok: true };
  } catch (error: unknown) {
    const data = error instanceof ApiError ? error.data : {};
    return {
      ok: false,
      message: getMessage(data),
    };
  }
}

/* ------------------ Cache helpers ------------------ */

function readCache(): CachedUser | null {
  if (!isBrowser()) return null;

  try {
    const raw = sessionStorage.getItem(USER_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeCache(user: User) {
  if (!isBrowser()) return;

  sessionStorage.setItem(
    USER_CACHE_KEY,
    JSON.stringify({
      user,
      timestamp: Date.now(),
    }),
  );
}

export function clearUserCache() {
  if (!isBrowser()) return;
  sessionStorage.removeItem(USER_CACHE_KEY);
}

/* ------------------ Public API ------------------ */

/**
 * UI helper ONLY
 * - Speeds up client rendering
 * - Never use for auth gating
 */
export async function getCurrentUser(): Promise<User | null> {
  const cached = readCache();

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.user;
  }

  try {
    const user = await frontendApiGet<User>("/api/v1/auth/users/me");
    if (isRecord(user)) {
      writeCache(user as User);
      return user as User;
    }
    return null;
  } catch {
    clearUserCache();
    return null;
  }
}

/**
 * Optional explicit hooks (still useful)
 */
export function onAuthSuccess() {
  clearUserCache();
}
