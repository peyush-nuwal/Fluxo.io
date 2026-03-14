export const sendSuccess = (res, status, message, payload = {}) =>
  res.status(status).json({
    success: true,
    message,
    ...payload,
  });

export const sendError = (res, status, message, payload = {}) =>
  res.status(status).json({
    success: false,
    message,
    error: message,
    ...payload,
  });

export const formatZodDetails = (error) =>
  error.errors.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));
