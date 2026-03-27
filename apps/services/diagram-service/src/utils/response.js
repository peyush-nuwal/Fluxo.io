const isObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

export const sendSuccess = (res, status, message, payload = null) =>
  res.status(status).json({
    success: true,
    message,
    data: payload,
  });

export const sendError = (res, status, message, payload = null) =>
  res.status(status).json({
    success: false,
    message,
    error: message,
    data: payload,
  });

export const formatZodDetails = (error) =>
  error.errors.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));
