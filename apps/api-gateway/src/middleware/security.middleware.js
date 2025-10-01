import { slidingWindow } from "@arcjet/node";
import aj from "../config/arcjet.js";
import logger from "../config/logger.js";

/**
 * 🛡️ Arcjet Security Middleware
 *
 * This middleware applies request limits using Arcjet.
 * - 5 requests per 2 seconds
 *
 * 👉 Note: Uses DRY_RUN mode for development, LIVE mode for production
 */
const securityMiddleware = async (req, res, next) => {
  try {
    // Debug: Log the API key status
    console.log("🔍 Arcjet API Key Status:", {
      hasKey: !!process.env.ARCJET_KEY,
      keyLength: process.env.ARCJET_KEY?.length || 0,
      keyPrefix: process.env.ARCJET_KEY?.substring(0, 10) || "none",
    });

    // Skip Arcjet if no valid key is configured
    if (!process.env.ARCJET_KEY || process.env.ARCJET_KEY === "test-key") {
      logger.warn("⚠️  Arcjet disabled: No valid API key configured");
      return next();
    }

    // 👇 Create sliding window rule
    // DRY_RUN = logs what *would* be blocked, but doesn't deny requests
    const client = aj.withRule(
      slidingWindow({
        mode: process.env.NODE_ENV === "production" ? "LIVE" : "DRY_RUN",
        interval: 2, // 2 seconds
        max: 5, // 5 requests per window
        name: "api-gateway-limit",
      }),
    );

    // Run Arcjet protection against the current request
    const decision = await client.protect(req);

    // Debug: Log the Arcjet decision
    console.log("🛡️ Arcjet Decision:", {
      id: decision.id,
      conclusion: decision.conclusion,
      reason: decision.reason,
      isDenied: decision.isDenied,
    });

    // If Arcjet thinks the request *would* be denied
    if (decision.isDenied) {
      switch (decision.reason) {
        case "bot":
          logger.warn("Bot request blocked", {
            ip: req.ip,
            userAgent: req.get("User-Agent"),
            path: req.path,
          });
          return res.status(403).json({
            error: "Forbidden",
            message: "Automated requests are not allowed",
          });

        case "shield":
          logger.warn("Shield request blocked", {
            ip: req.ip,
            userAgent: req.get("User-Agent"),
            path: req.path,
            method: req.method,
          });
          return res.status(403).json({
            error: "Forbidden",
            message: "Request blocked by security policy",
          });

        case "rate_limit":
          logger.warn("Rate limit exceeded", {
            ip: req.ip,
            userAgent: req.get("User-Agent"),
            path: req.path,
            method: req.method,
          });
          return res.status(429).json({
            error: "Too Many Requests",
            message: "Rate limit exceeded (5 per 2 seconds). Slow down.",
          });
      }
    }

    // Always call next() since we’re testing
    next();
  } catch (error) {
    logger.error("Arcjet middleware error", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Something went wrong with securityMiddleware",
    });
  }
};

export default securityMiddleware;
