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

export const formatZodDetails = (error) => {
  const issues = Array.isArray(error?.issues)
    ? error.issues
    : Array.isArray(error?.errors)
      ? error.errors
      : [];

  return issues.map((issue) => ({
    field: Array.isArray(issue?.path) ? issue.path.join(".") : "",
    message: issue?.message || "Invalid value",
  }));
};
