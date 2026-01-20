import { cookies } from "next/headers";

const API_URL = process.env.API_URL!;

export async function getCurrentUser() {
  const cookieStore = cookies();

  const res = await fetch(`${API_URL}/api/v1/auth/me`, {
    headers: {
      cookie: cookieStore.toString(),
    },
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) return null;
  return res.json();
}
