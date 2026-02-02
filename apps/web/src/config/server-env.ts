// src/config/server-env.ts
const requireEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing env variable: ${key}`);
  }
  return value;
};

export const API_BASE_URL = requireEnv("NEXT_PUBLIC_API_BASE_URL");
