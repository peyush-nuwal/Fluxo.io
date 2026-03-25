import axios from "axios";

// Call API gateway directly from browser in development/production.
// This avoids duplicate proxy route maintenance in Next route handlers.
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

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
});

function getApiErrorMessage(data: any) {
  if (typeof data?.message === "string" && data.message.trim()) {
    return data.message;
  }

  if (typeof data?.error === "string" && data.error.trim()) {
    return data.error;
  }

  return "API request failed";
}

async function rawRequest(path: string, options: Record<string, any> = {}) {
  try {
    const isFormData =
      typeof FormData !== "undefined" && options.data instanceof FormData;

    const headers = { ...(options.headers || {}) };
    if (isFormData) {
      delete headers["Content-Type"];
      delete headers["content-type"];
    }

    let requestData = options.data;
    if (options.body !== undefined) {
      if (typeof options.body === "string") {
        try {
          requestData = JSON.parse(options.body);
        } catch {
          requestData = options.body;
        }
      } else {
        requestData = options.body;
      }
    }

    const res = await api.request({
      url: path,
      method: options.method || "GET",
      headers,
      data: requestData,
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
        getApiErrorMessage(retry.data),
        retry.status,
        retry.data,
      );
    }
  }

  throw new ApiError(getApiErrorMessage(first.data), first.status, first.data);
}
