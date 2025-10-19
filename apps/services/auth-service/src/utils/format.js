export const formatValidationsError = (errors) => {
  if (!errors || !errors.issues) return "Validations failed";

  if (Array.isArray(errors.issues))
    return errors.issues.map((i) => i.message).join(", ");

  return JSON.stringify(errors);
};
