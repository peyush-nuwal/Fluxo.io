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

/**
 * User signup with email verification
 */
export const signUp = async (req, res) => {
  try {
    const validationResult = signUpSchema.safeParse(req.body ?? {});

    if (!validationResult.success) {
      return res.status(400).json({
        error: "validation failed",
        details: formatValidationsError(validationResult.error),
      });
    }

    const { userName, name, email, password } = validationResult.data;
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsername = userName.trim().toLowerCase();

    // Check for existing username/email - return as field errors, not exceptions
    const errors = {};

    if (await isUsernameExist(normalizedUsername)) {
      errors.userName = [
        "This username is already taken. Please choose a different one.",
      ];
    }

    if (await isUserExist(normalizedEmail)) {
      errors.email = [
        "This email is already registered. Please sign in or use a different email.",
      ];
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        error: "validation failed",
        details: errors,
      });
    }

    // Auth service
    const user = await createUser({
      user_name: normalizedUsername,
      name,
      email: normalizedEmail,
      password,
    });

    // Generate and send email verification OTP
    const result = await generateAndStoreOTP(
      user.id,
      normalizedEmail,
      "email_verification",
    );

    if (!result?.success) {
      return res.status(400).json({
        error: "OTP generation failed",
        message: result.message || "Failed to generate verification OTP.",
      });
    }

    logger.info(
      `User registered successfully with email: ${normalizedEmail}. OTP sent for email verification.`,
    );

    return res.status(200).json({
      message:
        "User registered successfully. A verification OTP has been sent to your email.",
      user: {
        id: user.id,
        userName: user.user_name,
        name: user.name,
        email: user.email,
        email_verified: user.email_verified,
      },
      requiresEmailVerification: true,
    });
  } catch (error) {
    logger.error("Sign up failed:", error);

    return res.status(500).json({
      error: "Registration failed",
      message: "Something went wrong during registration. Please try again.",
    });
  }
};

/**
 * User signin with email verification check
 */
export const signIn = async (req, res) => {
  try {
    const validationResult = signInSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: "validation failed",
        details: formatValidationsError(validationResult.error),
      });
    }

    const { email, password } = validationResult.data;
    const user = await authenticateUser(email, password);

    // Check if email is verified
    if (!user.email_verified) {
      return res.status(403).json({
        error: "Email not verified",
        message: "Please verify your email before signing in",
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
    });

    return res.status(200).json({
      message: "Sign in success",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        email_verified: user.email_verified,
      },
    });
  } catch (error) {
    logger.error("Sign in failed:", error);

    // Handle specific error cases
    if (error.message === "User does not exist") {
      return res.status(404).json({
        error: "User not found",
        message:
          "No account found with this email. Please check your email or sign up.",
      });
    }
    if (error.message === "Invalid credentials") {
      return res.status(401).json({
        error: "Invalid credentials",
        message: "Incorrect email or password. Please try again.",
      });
    }
    if (error.message.includes("Login with")) {
      return res.status(400).json({
        error: "Social login required",
        message: `Please sign in using ${error.message.replace("Login with ", "")}.`,
      });
    }

    return res.status(500).json({
      error: "Sign in failed",
      message: "Something went wrong during sign in. Please try again.",
    });
  }
};

/**
 * User signout - clears authentication cookie
 */
export const signOut = (req, res) => {
  try {
    // Clear the auth cookie
    res.clearCookie("access_token", { path: "/" });
    res.clearCookie("refresh_token", { path: "/" });

    logger.info("User signed out successfully");

    return res.status(200).json({
      message: "User signed out successfully",
    });
  } catch (error) {
    logger.error("Error during sign out:", error);

    return res.status(500).json({
      error: "Sign out failed",
      message: "Something went wrong during sign out. Please try again.",
    });
  }
};

/**
 * Update user password (requires authentication)
 */
export const updatePassword = async (req, res) => {
  try {
    // Verify JWT token first
    const decoded = jwttoken.verifyAccessToken(req.cookies.access_token);

    if (!decoded) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    const validationResult = changePasswordSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: "validation failed",
        details: formatValidationsError(validationResult.error),
      });
    }

    const { oldPassword, newPassword } = validationResult.data;
    const userEmail = decoded.email; // Use email from JWT token, not request body

    await changeUserPassword(userEmail, oldPassword, newPassword);

    // Generate new JWT token after password change
    const newToken = await jwttoken.sign({
      id: decoded.id,
      email: decoded.email,
    });

    // Set new token cookie
    cookies.set(res, "token", newToken);

    logger.info(`Password changed successfully for user: ${userEmail}`);

    return res.status(200).json({
      message: "Password changed successfully",
      token: newToken, // Optional: return new token
    });
  } catch (error) {
    logger.error("Error changing password:", error);

    // Handle specific error cases
    if (error.message === "User does not exist") {
      return res.status(404).json({
        error: "User not found",
        message: "User account not found. Please sign in again.",
      });
    }
    if (error.message === "Invalid credentials") {
      return res.status(401).json({
        error: "Incorrect current password",
        message:
          "The current password you entered is incorrect. Please try again.",
      });
    }
    if (error.message.includes("Login with")) {
      return res.status(400).json({
        error: "Social login account",
        message:
          "Cannot change password for social login accounts. Please use the social login provider to manage your password.",
      });
    }

    return res.status(500).json({
      error: "Password change failed",
      message:
        "Something went wrong while changing your password. Please try again.",
    });
  }
};

// token-based verifyEmail removed; OTP-based verification is used instead

export const me = async (req, res) => {
  try {
    // Check for x-user-id header first (set by API gateway after token verification)
    // Fallback to cookie-based auth for direct access
    const userId = req.headers["x-user-id"];
    const accessToken = req.cookies?.access_token;

    logger.info("ME endpoint called", {
      hasUserId: !!userId,
      hasToken: !!accessToken,
      cookies: req.cookies ? Object.keys(req.cookies) : [],
      tokenPreview: accessToken ? accessToken.substring(0, 20) + "..." : "none",
    });

    let user;

    if (userId) {
      // API gateway has already verified the token and set x-user-id
      // Use email from header if available, otherwise verify token
      const userEmail = req.headers["x-user-email"];

      if (userEmail) {
        // Use email from API gateway (already verified)
        logger.info("ME endpoint: Using email from API gateway", {
          userId,
          email: userEmail,
        });
        user = await isUserExist(userEmail);
      } else if (accessToken) {
        // Fallback: verify token to get email
        try {
          const decoded = jwttoken.verifyAccessToken(accessToken);
          logger.info("ME endpoint: Token verified via API gateway", {
            userId,
            email: decoded.email,
          });
          user = await isUserExist(decoded.email);
        } catch (error) {
          logger.error("ME endpoint: Failed to verify token", {
            error: error.message,
            tokenPreview: accessToken?.substring(0, 20),
          });
          return res.status(401).json({ message: "Invalid token" });
        }
      } else {
        logger.warn("ME endpoint: x-user-id present but no email or token");
        return res.status(401).json({ message: "Missing authentication data" });
      }
    } else if (accessToken) {
      // Direct access with cookie (bypassing API gateway)
      try {
        const decoded = jwttoken.verifyAccessToken(accessToken);
        logger.info("ME endpoint: Token verified directly", {
          email: decoded.email,
        });
        user = await isUserExist(decoded.email);
      } catch (error) {
        logger.error("ME endpoint: Failed to verify token directly", {
          error: error.message,
          tokenPreview: accessToken?.substring(0, 20),
        });
        return res.status(401).json({ message: "Invalid token" });
      }
    } else {
      logger.warn("ME endpoint: No authentication provided", {
        hasUserId: !!userId,
        hasToken: !!accessToken,
        cookies: req.cookies,
      });
      return res.status(401).json({ message: "Not authenticated" });
    }

    if (!user) {
      logger.warn("ME endpoint: User not found");
      return res.status(401).json({ message: "User not found" });
    }

    return res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      email_verified: user.email_verified,
    });
  } catch (error) {
    logger.error("ME endpoint error:", error);
    // IMPORTANT: do not leak error details
    return res.status(401).json({ message: "Unauthorized" });
  }
};

export const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies.refresh_token;

    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token" });
    }

    const decoded = jwttoken.verifyRefreshToken(refreshToken);

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

    return res.status(200).json({ success: true });
  } catch {
    return res.status(401).json({ message: "Session expired" });
  }
};
