const isObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const getData = (payload) => {
  if (isObject(payload) && "data" in payload) {
    return payload.data;
  }
  return payload ?? null;
};

export const sendSuccess = (res, status, message, payload = null) =>
  res.status(status).json({
    success: true,
    message,
    data: payload,
  });

export const sendError = (res, status, message, payload = {}) =>
  res.status(status).json({
    success: false,
    message,
    error: message,
    data: getData(payload),
    ...(isObject(payload) ? payload : {}),
  });
