type UnknownRecord = Record<string, unknown>;

export const isRecord = (value: unknown): value is UnknownRecord =>
  !!value && typeof value === "object" && !Array.isArray(value);

export function getErrorMessage(error: unknown, fallback: string): string {
  if (isRecord(error)) {
    const message = error.message;
    if (typeof message === "string" && message.trim()) {
      return message;
    }

    const directError = error.error;
    if (typeof directError === "string" && directError.trim()) {
      return directError;
    }

    const nested = error.data;
    if (isRecord(nested)) {
      const nestedMessage = nested.message;
      if (typeof nestedMessage === "string" && nestedMessage.trim()) {
        return nestedMessage;
      }
      const nestedError = nested.error;
      if (typeof nestedError === "string" && nestedError.trim()) {
        return nestedError;
      }
    }
  }

  return fallback;
}

export function getErrorStatus(error: unknown): number | undefined {
  if (!isRecord(error)) return undefined;
  const status = error.status;
  return typeof status === "number" ? status : undefined;
}
