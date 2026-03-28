import axios from "axios";
import { ApiError } from "./api";

type FrontendApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type FrontendApiOptions = {
  method?: FrontendApiMethod;
  data?: unknown;
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
};

const frontendApi = axios.create({
  withCredentials: true,
});

export async function frontendApiRequest<T = any>(
  path: string,
  options: FrontendApiOptions = {},
): Promise<T> {
  try {
    const isFormData =
      typeof FormData !== "undefined" && options.data instanceof FormData;

    const headers = { ...(options.headers || {}) };
    if (isFormData) {
      delete headers["Content-Type"];
      delete headers["content-type"];
    }

    const response = await frontendApi.request<T>({
      url: path,
      method: options.method || "GET",
      data: options.data,
      params: options.params,
      headers,
    });

    return response.data;
  } catch (error: any) {
    const status = error?.response?.status ?? 500;
    const data = error?.response?.data ?? {};
    const message =
      typeof data?.message === "string" && data.message.trim()
        ? data.message
        : typeof data?.error === "string" && data.error.trim()
          ? data.error
          : "API request failed";

    throw new ApiError(message, status, data);
  }
}

export const frontendApiGet = <T = any>(
  path: string,
  params?: Record<string, unknown>,
) => frontendApiRequest<T>(path, { method: "GET", params });

export const frontendApiPost = <T = any>(path: string, data?: unknown) =>
  frontendApiRequest<T>(path, { method: "POST", data });

export const frontendApiPut = <T = any>(path: string, data?: unknown) =>
  frontendApiRequest<T>(path, { method: "PUT", data });

export const frontendApiPatch = <T = any>(path: string, data?: unknown) =>
  frontendApiRequest<T>(path, { method: "PATCH", data });

export const frontendApiDelete = <T = any>(path: string, data?: unknown) =>
  frontendApiRequest<T>(path, { method: "DELETE", data });
