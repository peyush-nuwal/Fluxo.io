export async function getUserInfo() {
  const res = await fetch("/api/v1/auth/users/me", {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    // 401, 403, etc → user not authenticated
    throw new Error("Failed to fetch user info");
  }

  const data = await res.json();
  return data;
}
