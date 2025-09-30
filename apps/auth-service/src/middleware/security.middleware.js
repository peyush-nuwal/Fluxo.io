import logger from "../config/logger.js";

// Basic security middleware
const securityMiddleware = (req, res, next) => {
  // Add security headers
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");

  // Log security events
  if (req.path.includes("..") || req.path.includes("~")) {
    logger.warn(`Potential path traversal attempt from ${req.ip}: ${req.path}`);
    return res.status(400).json({ error: "Invalid path" });
  }

  next();
};

export default securityMiddleware;
