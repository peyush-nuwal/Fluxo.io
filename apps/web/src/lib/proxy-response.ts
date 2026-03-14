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

export function buildProxyErrorPayload(
  data: unknown,
  fallback = "Request failed",
) {
  return {
    ...(data && typeof data === "object"
      ? (data as Record<string, unknown>)
      : {}),
    message: getProxyResponseMessage(data, fallback),
  };
}
