export const SERVICES = {
  AUTH: process.env.AUTH_SERVICE_URL || "http://localhost:4001",
  DIAGRAM: process.env.DIAGRAM_SERVICE_URL || "http://localhost:4002",
  DOCS: process.env.DOCS_SERVICE_URL || "http://localhost:4003",
  AI: process.env.AI_SERVICE_URL || "http://localhost:4004",

  // Subscription service uses explicit IPv4 loopback to avoid IPv6 resolution quirks.
  SUBSCRIPTION: process.env.SUBSCRIPTION_SERVICE_URL || "http://127.0.0.1:4006",
};

// Gateway port configuration
export const PORT = process.env.PORT || 4000;

// Fallback secret for dev environments.
// (Production should ALWAYS define JWT_SECRET.)
// Use ACCESS_TOKEN_SECRET to match auth service token signing
export const JWT_SECRET =
  process.env.ACCESS_TOKEN_SECRET ||
  process.env.JWT_SECRET ||
  "access-secret-dev";
