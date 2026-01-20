"use client";

import { apiFetch } from "./api";

export interface User {
  id: string;
  name: string;
  email: string;
  email_verified: boolean;
}

const USER_CACHE_KEY = "user_cache";
const CACHE_DURATION = 5 * 60 * 1000;

interface CachedUser {
  user: User;
  timestamp: number;
}

function getCachedUser(): CachedUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(USER_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearUserCache() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(USER_CACHE_KEY);
}

/**
 * UI helper ONLY
 * Do NOT use for auth gating
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const cached = getCachedUser();
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.user;
    }

    const user = await apiFetch("/api/v1/auth/me");

    sessionStorage.setItem(
      USER_CACHE_KEY,
      JSON.stringify({ user, timestamp: Date.now() }),
    );

    return user;
  } catch {
    clearUserCache();
    return null;
  }
}
