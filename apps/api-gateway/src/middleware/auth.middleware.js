import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config.js";
import logger from "../config/logger.js";

export const verifyToken = (req, res, next) => {
  // Don't protect auth endpoints (signup, signin, signout)
  if (
    req.path.includes("/signup") ||
    req.path.includes("/signin") ||
    req.path.includes("/signout")
  ) {
    return next();
  }

  // Don't protect health check
  if (req.path === "/health") {
    return next();
  }

  // Don't protect root API endpoint
  if (req.path === "/api/v1") {
    return next();
  }

  // Try to get token from cookie first, then from Authorization header
  const token =
    req.cookies?.token ||
    req.headers["authorization"]?.split(" ")[1] ||
    req.headers["Authorization"]?.split(" ")[1];

  logger.info("Auth middleware:", {
    path: req.path,
    hasToken: !!token,
    tokenStart: token?.substring(0, 20),
    JWT_SECRET_USED: JWT_SECRET,
  });

  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // attach user payload
    logger.info("Token verified successfully:", decoded);
    next();
  } catch (error) {
    logger.error("Token verification failed:", {
      message: error.message,
      name: error.name,
      JWT_SECRET_LENGTH: JWT_SECRET?.length,
    });
    return res.status(403).json({ error: "Invalid token" });
  }
};
