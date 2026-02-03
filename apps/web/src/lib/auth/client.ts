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
    throw data;
  }

  clearUserCache();
  return data;
}

export async function signup(
  userName: string,
  name: string,
  email: string,
  password: string,
) {
  const res = await fetch("/api/v1/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ userName, name, email, password }),
  });

  const text = await res.text();
  let data: any = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text };
  }

  if (!res.ok) {
    return {
      ok: false,
      message: data?.message || "Signup failed",
      details: data?.details,
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
  window.location.href = `${API_BASE_URL}/api/v1/auth/oauth/${provider}`;
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
    const user = await apiFetch("/api/v1/auth/me");
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
