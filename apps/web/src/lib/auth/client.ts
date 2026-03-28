"use client";

import { apiFetch } from "../api";

export type OAuthProvider = "google" | "github";
export interface User {
  id: string;
  name: string;
  email: string;
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
  const res = await fetch("/api/v1/auth/signin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });

  let data;
  try {
    data = await res.json();
  } catch (e) {
    throw {
      error: "Failed to parse response",
      message: "Something went wrong. Please try again.",
    };
  }

  if (!res.ok) {
    throw {
      ...data,
      details: normalizeErrorDetails(data?.details, data?.message),
    };
  }

  clearUserCache();
  return data;
}

export async function signup(
  username: string,
  name: string,
  email: string,
  password: string,
) {
  const res = await fetch("/api/v1/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ username, name, email, password }),
  });

  const text = await res.text();
  let data: any = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text };
  }

  if (!res.ok) {
    const message = data?.message || "Signup failed";
    return {
      ok: false,
      message,
      details: normalizeErrorDetails(data?.details, message),
    };
  }

  clearUserCache();
  return { ok: true, data };
}

export async function onLogout() {
  const res = await fetch("/api/v1/auth/logout", {
    method: "POST",
    credentials: "include",
  });

  const data = await res.json();
  // 🔥 clear client state
  localStorage.clear();
  sessionStorage.clear();
  clearUserCache(); // client-side state cleanup

  if (!res.ok) {
    throw data;
  }

  return data.message;
}

export function startOAuth(provider: OAuthProvider) {
  if (!API_BASE_URL) {
    throw new Error("Missing env variable: NEXT_PUBLIC_API_BASE_URL");
  }
  console.log("clicked ", provider);
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
  const res = await fetch("/api/v1/auth/otp/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    return { ok: false, message: data.message };
  }

  clearUserCache();
  return { ok: true };
}

export async function resendEmailOtp(body: ResendOtpToEmailPayload) {
  const res = await fetch("/api/v1/auth/otp/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    return { ok: false, message: data.message };
  }

  return { ok: true };
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
    const user = await apiFetch("/api/v1/auth/users/me");
    writeCache(user);
    return user;
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
