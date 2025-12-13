import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config.js";
import logger from "../config/logger.js";

export const verifyToken = (req, res, next) => {
  console.log("🔍 verifyToken PATH:", req.path);

  const publicPaths = [
    "/signup",
    "/signin",
    "/signout",
    "/verify-email",
    "/forgot-password",
    "/reset-password",
    "/health",
  ];

  // Skip public routes cleanly
  if (publicPaths.some((p) => req.path.startsWith(p))) {
    return next();
  }

  // Extract token ONLY from headers or cookies
  const authHeader = req.headers.authorization;
  const token =
    req.cookies?.token ||
    (authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null);

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // ***DO NOT TOUCH req.body or request stream***
    req.user = decoded;

    // Attach identity to headers for proxy
    req.headers["x-user-id"] = decoded.id;
    req.headers["x-user-email"] = decoded.email;

    next();
  } catch (error) {
    return res.status(403).json({ error: "Invalid token" });
  }
};
