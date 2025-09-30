import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config.js";

export const verifyToken = (req, res, next) => {
  // Don’t protect login/signup
  if (req.path.includes("/login") || req.path.includes("/signup")) {
    return next();
  }

  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // attach user payload
    next();
  } catch {
    return res.status(403).json({ error: "Invalid token" });
  }
};
