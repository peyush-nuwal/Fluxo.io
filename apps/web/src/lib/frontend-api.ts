import axios from "axios";
import { ApiError } from "./api";
import { isRecord } from "./error-utils";

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

export async function frontendApiRequest<T = unknown>(
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
  } catch (error: unknown) {
    const response = isRecord(error) ? error.response : undefined;
    const status =
      isRecord(response) && typeof response.status === "number"
        ? response.status
        : 500;
    const data = isRecord(response) ? (response.data ?? {}) : {};
    const message =
      isRecord(data) && typeof data.message === "string" && data.message.trim()
        ? data.message
        : isRecord(data) && typeof data.error === "string" && data.error.trim()
          ? data.error
          : "API request failed";

    throw new ApiError(message, status, data);
  }
}

export const frontendApiGet = <T = unknown>(
  path: string,
  params?: Record<string, unknown>,
) => frontendApiRequest<T>(path, { method: "GET", params });

export const frontendApiPost = <T = unknown>(path: string, data?: unknown) =>
  frontendApiRequest<T>(path, { method: "POST", data });

export const frontendApiPut = <T = unknown>(path: string, data?: unknown) =>
  frontendApiRequest<T>(path, { method: "PUT", data });

export const frontendApiPatch = <T = unknown>(path: string, data?: unknown) =>
  frontendApiRequest<T>(path, { method: "PATCH", data });

export const frontendApiDelete = <T = unknown>(path: string, data?: unknown) =>
  frontendApiRequest<T>(path, { method: "DELETE", data });
