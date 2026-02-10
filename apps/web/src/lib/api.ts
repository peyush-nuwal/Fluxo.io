import axios from "axios";

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

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

async function rawRequest(path: string, options: Record<string, any> = {}) {
  try {
    const res = await api.request({
      url: path,
      method: options.method || "GET",
      headers: options.headers,
      data: options.body ? JSON.parse(options.body) : options.data,
      params: options.params,
    });
    return { status: res.status, data: res.data };
  } catch (error: any) {
    const status = error?.response?.status ?? 500;
    const data = error?.response?.data ?? {};
    return { status, data };
  }
}

export async function apiFetch(
  path: string,
  options: Record<string, any> = {},
) {
  const first = await rawRequest(path, options);

  if (first.status >= 200 && first.status < 300) return first.data;

  // Attempt one refresh on 401, then retry once.
  if (first.status === 401 && !path.includes("/auth/refresh")) {
    const refresh = await rawRequest("/api/v1/auth/refresh", {
      method: "GET",
    });

    if (refresh.status >= 200 && refresh.status < 300) {
      const retry = await rawRequest(path, options);
      if (retry.status >= 200 && retry.status < 300) return retry.data;
      throw new ApiError(
        retry.data?.message || "API request failed",
        retry.status,
        retry.data,
      );
    }
  }

  throw new ApiError(
    first.data?.message || "API request failed",
    first.status,
    first.data,
  );
}
