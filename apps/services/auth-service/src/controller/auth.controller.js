import logger from "../config/logger.js";
import {
  authenticateUser,
  createUser,
  changeUserPassword,
  isUsernameExist,
  isUserExist,
} from "../service/auth.service.js";
import { generateAndStoreOTP } from "../service/otp.service.js";
import { cookies } from "../utils/cookie.js";
import { formatValidationsError } from "../utils/format.js";
import { jwttoken } from "../utils/jwt.js";
import {
  signInSchema,
  signUpSchema,
  changePasswordSchema,
} from "../../../../../packages/zod-schemas/index.js";
import { sendError, sendSuccess } from "../utils/response.js";

const toUserResponse = (user) => ({
  id: user.id,
  name: user.name,
  user_name: user.user_name ?? null,
  avatar_url: user.avatar_url ?? null,
  email: user.email,
  email_verified: user.email_verified,
});

/**
 * SIGN UP
 */
export const signUp = async (req, res) => {
  try {
    const validationResult = signUpSchema.safeParse(req.body ?? {});

    if (!validationResult.success) {
      return sendError(res, 400, "Validation failed", {
        errors: formatValidationsError(validationResult.error),
      });
    }

    const { userName, name, email, password } = validationResult.data;
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsername = userName.trim().toLowerCase();

    const errors = {};

    if (await isUsernameExist(normalizedUsername)) {
      errors.userName = ["Username already taken"];
    }

    if (await isUserExist(normalizedEmail)) {
      errors.email = ["Email already registered"];
    }

    if (Object.keys(errors).length > 0) {
      return sendError(res, 400, "Validation failed", { errors });
    }

    const user = await createUser({
      user_name: normalizedUsername,
      name,
      email: normalizedEmail,
      password,
    });

    const result = await generateAndStoreOTP(
      user.id,
      normalizedEmail,
      "email_verification",
    );

    if (!result?.success) {
      return sendError(res, 400, "OTP generation failed");
    }

    return sendSuccess(res, 200, "User registered. OTP sent for verification", {
      user: toUserResponse(user),
      requiresEmailVerification: true,
    });
  } catch (error) {
    logger.error("Sign up failed:", error);
    return sendError(res, 500, "Registration failed");
  }
};

/**
 * SIGN IN
 */
export const signIn = async (req, res) => {
  try {
    const validationResult = signInSchema.safeParse(req.body);

    if (!validationResult.success) {
      return sendError(res, 400, "Validation failed", {
        errors: formatValidationsError(validationResult.error),
      });
    }

    const { email, password } = validationResult.data;
    const user = await authenticateUser(email, password);

    if (!user.email_verified) {
      return sendError(res, 403, "Email not verified", {
        email: user.email,
        requiresEmailVerification: true,
      });
    }

    const accessToken = jwttoken.signAccessToken({
      id: user.id,
      email: user.email,
    });

    const refreshToken = jwttoken.signRefreshToken({
      id: user.id,
      email: user.email,
    });

    cookies.set(res, "access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    cookies.set(res, "refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return sendSuccess(res, 200, "Sign in success", {
      user: toUserResponse(user),
    });
  } catch (error) {
    logger.error("Sign in failed:", error);

    if (error.message === "User does not exist") {
      return sendError(res, 404, "User not found");
    }

    if (error.message === "Invalid credentials") {
      return sendError(res, 401, "Invalid credentials");
    }

    if (error.message.includes("Login with")) {
      return sendError(res, 400, "Use social login");
    }

    return sendError(res, 500, "Sign in failed");
  }
};

/**
 * SIGN OUT
 */
export const signOut = (req, res) => {
  try {
    res.clearCookie("access_token", { path: "/" });
    res.clearCookie("refresh_token", { path: "/" });

    return sendSuccess(res, 200, "Signed out successfully", {
      signed_out: true,
    });
  } catch (error) {
    logger.error("Sign out error:", error);
    return sendError(res, 500, "Sign out failed");
  }
};

/**
 * UPDATE PASSWORD
 */
export const updatePassword = async (req, res) => {
  try {
    const decoded = jwttoken.verifyAccessToken(req.cookies.access_token);

    if (!decoded) return sendError(res, 401, "Invalid or expired token");

    const validationResult = changePasswordSchema.safeParse(req.body);

    if (!validationResult.success) {
      return sendError(res, 400, "Validation failed", {
        errors: formatValidationsError(validationResult.error),
      });
    }

    const { oldPassword, newPassword } = validationResult.data;

    await changeUserPassword(decoded.email, oldPassword, newPassword);

    return sendSuccess(res, 200, "Password changed successfully", {
      password_updated: true,
    });
  } catch (error) {
    logger.error("Password change failed:", error);

    if (error.message === "User does not exist") {
      return sendError(res, 404, "User not found");
    }

    if (error.message === "Invalid credentials") {
      return sendError(res, 401, "Incorrect current password");
    }

    return sendError(res, 500, "Password change failed");
  }
};

/**
 * ME
 */
export const me = async (req, res) => {
  try {
    const accessToken = req.cookies?.access_token;

    if (!accessToken) return sendError(res, 401, "Not authenticated");

    const decoded = jwttoken.verifyAccessToken(accessToken);
    const user = await isUserExist(decoded.email);

    if (!user) return sendError(res, 401, "User not found");

    return sendSuccess(res, 200, "User fetched", {
      user: toUserResponse(user),
    });
  } catch (error) {
    logger.error("ME error:", error);
    return sendError(res, 401, "Unauthorized");
  }
};

/**
 * REFRESH TOKEN
 */
export const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies.refresh_token;

    if (!refreshToken) return sendError(res, 401, "No refresh token");

    const decoded = jwttoken.verifyRefreshToken(refreshToken);

    if (!decoded?.email) return sendError(res, 401, "Session expired");

    const newAccessToken = jwttoken.signAccessToken({
      id: decoded.id,
      email: decoded.email,
    });

    res.cookie("access_token", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return sendSuccess(res, 200, "Token refreshed", {
      token_refreshed: true,
    });
  } catch (error) {
    logger.error("Refresh token error:", error);
    return sendError(res, 401, "Session expired");
  }
};
