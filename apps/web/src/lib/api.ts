const API_URL = process.env.NEXT_PUBLIC_API_URL;

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function rawFetch(path: string, options: Record<string, any> = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const data = await res.json().catch(() => ({}));
  return { res, data };
}

export async function apiFetch(
  path: string,
  options: Record<string, any> = {},
) {
  const { res, data } = await rawFetch(path, options);

  if (res.ok) return data;

  // Attempt one refresh on 401, then retry once.
  if (res.status === 401 && !path.includes("/auth/refresh")) {
    const refresh = await rawFetch("/api/v1/auth/refresh", {
      method: "GET",
    });

    if (refresh.res.ok) {
      const retry = await rawFetch(path, options);
      if (retry.res.ok) return retry.data;
      throw new ApiError(
        retry.data.message || "API request failed",
        retry.res.status,
        retry.data,
      );
    }
  }

  throw new ApiError(data.message || "API request failed", res.status, data);
}
