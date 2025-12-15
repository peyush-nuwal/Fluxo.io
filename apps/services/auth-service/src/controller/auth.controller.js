import logger from "../config/logger.js";
import {
  authenticateUser,
  createUser,
  changeUserPassword,
  isUsernameExist,
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
      return res.status(422).json({
        message: "Validation failed",
        errors: formatValidationsError(validationResult.error),
      });
    }

    const { userName, name, email, password } = validationResult.data;
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsername = userName.trim().toLowerCase();

    if (await isUsernameExist(normalizedUsername)) {
      return res.status(409).json({
        message: "Username already exists",
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
      return res.status(400).json({ error: result.message });
    }

    logger.info(
      `User registered successfully with email: ${normalizedEmail}. We have sent a verification OTP to your email.`,
    );

    return res.status(201).json({
      message:
        "User registered successfully. A verification OTP has been sent to your email. Please verify to continue.",
      user: {
        userName: user.user_name,
        id: user.id,
        name: user.name,
        email: user.email,
        email_verified: user.email_verified,
      },
      requiresEmailVerification: true,
    });
  } catch (error) {
    logger.error("Sign up failed:", error);

    // Handle specific error cases
    if (error.message === "User already exists") {
      return res.status(409).json({
        error: "User already exists",
        message:
          "An account with this email already exists. Please use a different email or try signing in.",
      });
    }
    if (error.message.includes("Email configuration")) {
      return res.status(503).json({
        error: "Email service unavailable",
        message:
          "We're having trouble sending verification emails. Please try again later.",
      });
    }
    if (error.message.includes("validation failed")) {
      return res.status(400).json({
        error: "Invalid input",
        message: "Please check your input and try again.",
      });
    }

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

    const token = await jwttoken.sign({
      id: user.id,
      email: user.email,
    });

    cookies.set(res, "token", token);

    return res.status(200).json({
      message: "Sign in success",
      token: token,
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
    cookies.clear(res, "token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

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
    const decoded = jwttoken.verify(req.cookies.token);

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
