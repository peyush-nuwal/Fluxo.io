export const SERVICES = {
  AUTH: process.env.AUTH_SERVICE_URL || "http://localhost:4001",
  USER: process.env.USER_SERVICE_URL || "http://localhost:4002",
  DOCS: process.env.DOCS_SERVICE_URL || "http://localhost:4003",
};

export const PORT = process.env.PORT || 4000;
export const JWT_SECRET = process.env.JWT_SECRET || "super-secret";
