import type { ApiResponse } from "@/types/api";

export function getProxyResponseMessage(
  data: unknown,
  fallback = "Request failed",
) {
  if (typeof data === "string" && data.trim()) {
    return data;
  }

  if (data && typeof data === "object") {
    const payload = data as Record<string, unknown>;

    if (typeof payload.message === "string" && payload.message.trim()) {
      return payload.message;
    }

    if (typeof payload.error === "string" && payload.error.trim()) {
      return payload.error;
    }
  }

  return fallback;
}

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord =>
  !!value && typeof value === "object" && !Array.isArray(value);

const hasApiResponseShape = (value: unknown): value is ApiResponse<unknown> => {
  if (!isRecord(value)) return false;
  return (
    typeof value.success === "boolean" &&
    typeof value.message === "string" &&
    "data" in value
  );
};

export function buildProxySuccessPayload(
  data: unknown,
  success = true,
  fallback = "Request successful",
): ApiResponse<unknown> {
  if (hasApiResponseShape(data)) {
    return data;
  }

  return {
    success,
    message: getProxyResponseMessage(data, fallback),
    data,
  };
}

export function buildProxyErrorPayload(data: unknown): ApiResponse<unknown> {
  if (hasApiResponseShape(data)) {
    return {
      ...data,
      success: false,
      message: getProxyResponseMessage(data, data.message),
    };
  }

  const message =
    typeof data === "object" &&
    data !== null &&
    "message" in data &&
    typeof (data as Record<string, unknown>).message === "string"
      ? (data as Record<string, string>).message
      : undefined;

  return {
    success: false,
    message: getProxyResponseMessage(data, message),
    data,
  };
}
