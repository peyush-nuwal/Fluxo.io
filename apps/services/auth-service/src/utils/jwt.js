import logger from "../config/logger.js";
import jwt from "jsonwebtoken";

const ACCESS_TOKEN_SECRET =
  process.env.ACCESS_TOKEN_SECRET || "access-secret-dev";

const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || "refresh-secret-dev";

const ACCESS_TOKEN_EXPIRES_IN = "1h";
const REFRESH_TOKEN_EXPIRES_IN = "7d";

export const jwttoken = {
  /* =========================
     GENERIC TOKEN (legacy)
  ========================= */
  sign(payload, options = {}) {
    try {
      return jwt.sign(payload, ACCESS_TOKEN_SECRET, options);
    } catch (error) {
      logger.error("Failed to sign token", error);
      throw new Error("Failed to sign token");
    }
  },

  verify(token) {
    try {
      return jwt.verify(token, ACCESS_TOKEN_SECRET);
    } catch (error) {
      throw new Error("Invalid or expired token");
    }
  },

  /* =========================
     ACCESS TOKEN
  ========================= */
  signAccessToken(payload) {
    try {
      return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
        expiresIn: ACCESS_TOKEN_EXPIRES_IN,
      });
    } catch (error) {
      logger.error("Failed to sign access token", error);
      throw new Error("Failed to sign access token");
    }
  },

  verifyAccessToken(token) {
    try {
      return jwt.verify(token, ACCESS_TOKEN_SECRET);
    } catch (error) {
      throw new Error("Invalid or expired access token");
    }
  },

  /* =========================
     REFRESH TOKEN
  ========================= */
  signRefreshToken(payload) {
    try {
      return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
        expiresIn: REFRESH_TOKEN_EXPIRES_IN,
      });
    } catch (error) {
      logger.error("Failed to sign refresh token", error);
      throw new Error("Failed to sign refresh token");
    }
  },

  verifyRefreshToken(token) {
    try {
      return jwt.verify(token, REFRESH_TOKEN_SECRET);
    } catch (error) {
      throw new Error("Invalid or expired refresh token");
    }
  },
};
