export const formatValidationsError = (error) => {
  if (!error || !Array.isArray(error.issues)) return [];

  return error.issues.map((e) => ({
    field: e.path.join("."),
    message: e.message,
  }));
};
