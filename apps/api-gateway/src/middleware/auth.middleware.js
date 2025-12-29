import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config.js";
import logger from "../config/logger.js";

// Routes that NEVER require auth
const PUBLIC_PATHS = [
  "/api/v1/auth/signup",
  "/api/v1/auth/signin",
  "/api/v1/auth/signout",
  "/api/v1/auth/verify-email",
  "/api/v1/auth/forgot-password",
  "/api/v1/auth/reset-password",
  "/health",
];

// Helper: check if request is public
const isPublicRoute = (req) => {
  return PUBLIC_PATHS.some(
    (path) => req.path === path || req.path.startsWith(`${path}/`),
  );
};

export const verifyToken = (req, res, next) => {
  // 1️⃣ Allow public routes immediately
  console.log("requested path", req.path);
  if (isPublicRoute(req)) {
    return next();
  }

  // 2️⃣ Extract token (cookie preferred, header fallback)
  const authHeader = req.headers.authorization;
  const token =
    req.cookies?.token ||
    (authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null);

  if (!token) {
    return res.status(401).json({
      message: "Authentication required",
    });
  }

  try {
    // 3️⃣ Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // 4️⃣ Normalize identity (THIS IS CRITICAL)
    const userId = decoded.userId || decoded.id || decoded.sub;

    if (!userId) {
      return res.status(401).json({
        message: "Invalid token payload",
      });
    }

    // 5️⃣ Attach auth context (single source of truth)
    req.authContext = {
      userId: decoded.userId || decoded.id || decoded.sub,
    };

    console.log("VERIFY TOKEN authContext:", req.authContext);

    return next();
  } catch (error) {
    return res.status(403).json({
      message: "Invalid or expired token",
    });
  }
};
