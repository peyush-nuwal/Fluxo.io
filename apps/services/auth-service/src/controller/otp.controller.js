import logger from "../config/logger.js";
import { isUserExist, comparePassword } from "../service/auth.service.js";
import {
  generateAndStoreOTP,
  verifyOTP,
  resendOTP,
  getOTPStatus,
  cleanupExpiredOTPs,
  testEmailConfiguration,
} from "../service/otp.service.js";
import { markEmailAsVerified } from "../service/auth.service.js";
import { changeUserEmail, resetUserPassword } from "../service/auth.service.js";
import { jwttoken } from "../utils/jwt.js";
import { formatValidationsError } from "../utils/format.js";
import { cookies } from "../utils/cookie.js"; // Add this line
import {
  generateOTPSchema,
  verifyOTPSchema,
  resendOTPSchema,
  getOTPStatusSchema,
  requestEmailChangeSchema,
  verifyEmailChangeSchema,
  forgotPasswordSchema,
  verifyPasswordResetOTPSchema,
  resetPasswordSchema,
} from "../../../../../packages/zod-schemas/index.js";

/**
 * Generate and send OTP
 */
export const generateOTP = async (req, res) => {
  try {
    const validationResult = generateOTPSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: "validation failed",
        details: formatValidationsError(validationResult.error),
      });
    }

    const { email, purpose } = validationResult.data;

    // Check if user exists
    const user = await isUserExist(email);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Generate and send OTP
    const result = await generateAndStoreOTP(user.id, email, purpose);

    logger.info(
      `OTP generated successfully for user: ${email}, purpose: ${purpose}`,
    );

    return res.status(200).json({
      message: "OTP sent successfully",
      expiresIn: result.expiresIn,
    });
  } catch (error) {
    logger.error("Generate OTP failed:", error);

    // Handle specific error cases
    if (error.message.includes("Email configuration")) {
      return res.status(503).json({
        error: "Email service unavailable",
        message: "We're having trouble sending emails. Please try again later.",
      });
    }
    if (error.message.includes("User not found")) {
      return res.status(404).json({
        error: "User not found",
        message:
          "No account found with this email. Please check your email or sign up.",
      });
    }

    return res.status(500).json({
      error: "OTP generation failed",
      message:
        "Something went wrong while generating the OTP. Please try again.",
    });
  }
};

/**
 * Verify OTP code
 */
export const verifyOTPCode = async (req, res) => {
  try {
    const validationResult = verifyOTPSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: "validation failed",
        details: formatValidationsError(validationResult.error),
      });
    }

    const { email, otpCode, purpose } = validationResult.data;

    // Check if user exists
    const user = await isUserExist(email);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Verify OTP
    await verifyOTP(user.id, email, otpCode, purpose);

    // If this is email verification, mark email as verified
    if (purpose === "email_verification") {
      await markEmailAsVerified(user.id);

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
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      logger.info(`Email verified successfully for user: ${email}`);
    }

    logger.info(
      `OTP verified successfully for user: ${email}, purpose: ${purpose}`,
    );

    return res.status(200).json({
      message: "OTP verified successfully",
      emailVerified: purpose === "email_verification",
    });
  } catch (error) {
    logger.error("Verify OTP failed:", error);

    // Handle specific error cases
    if (error.message === "Invalid or expired OTP") {
      return res.status(400).json({
        error: "Invalid or expired OTP",
        message:
          "The OTP you entered is invalid or has expired. Please request a new one.",
      });
    }
    if (error.message === "OTP has expired") {
      return res.status(400).json({
        error: "OTP expired",
        message: "The OTP has expired. Please request a new one.",
      });
    }
    if (error.message === "Maximum verification attempts exceeded") {
      return res.status(429).json({
        error: "Too many attempts",
        message:
          "You've exceeded the maximum number of attempts. Please request a new OTP.",
      });
    }
    if (error.message === "Invalid OTP code") {
      return res.status(400).json({
        error: "Invalid OTP",
        message:
          "The OTP code you entered is incorrect. Please check and try again.",
      });
    }
    if (error.message === "User not found") {
      return res.status(404).json({
        error: "User not found",
        message:
          "No account found with this email. Please check your email or sign up.",
      });
    }

    return res.status(500).json({
      error: "OTP verification failed",
      message:
        "Something went wrong while verifying the OTP. Please try again.",
    });
  }
};

/**
 * Request OTP for email change
 */
export const requestEmailChange = async (req, res) => {
  try {
    // Verify JWT token first
    const decoded = jwttoken.verify(req.cookies.token);

    if (!decoded) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    // Validate request body
    const validationResult = requestEmailChangeSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: "validation failed",
        details: formatValidationsError(validationResult.error),
      });
    }

    const { newEmail } = validationResult.data;
    const normalizedCurrent = decoded.email; // Use email from JWT token
    const normalizedNew = newEmail.trim().toLowerCase();

    if (normalizedCurrent === normalizedNew) {
      return res.status(400).json({
        error: "New email must be different from current email",
      });
    }

    const user = await isUserExist(normalizedCurrent);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Generate OTP to new email to confirm ownership
    const result = await generateAndStoreOTP(
      user.id,
      normalizedNew,
      "email_change",
    );

    if (!result?.success) {
      return res.status(400).json({ error: result.message });
    }

    logger.info(
      `Email change OTP sent to new email for user: ${normalizedCurrent} -> ${normalizedNew}`,
    );

    return res.status(200).json({
      message: "OTP sent to new email for verification",
      expiresIn: result.expiresIn,
    });
  } catch (error) {
    logger.error("Request email change OTP failed:", error);

    // Handle specific error cases
    if (error.message.includes("Email configuration")) {
      return res.status(503).json({
        error: "Email service unavailable",
        message: "We're having trouble sending emails. Please try again later.",
      });
    }
    if (error.message.includes("User not found")) {
      return res.status(404).json({
        error: "User not found",
        message: "User account not found. Please sign in again.",
      });
    }

    return res.status(500).json({
      error: "Email change request failed",
      message:
        "Something went wrong while requesting email change. Please try again.",
    });
  }
};

/**
 * Verify OTP and change email
 */
export const verifyEmailChange = async (req, res) => {
  try {
    // Verify JWT token first
    const decoded = jwttoken.verify(req.cookies.token);

    if (!decoded) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    // Validate request body
    const validationResult = verifyEmailChangeSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: "validation failed",
        details: formatValidationsError(validationResult.error),
      });
    }

    const { newEmail, otpCode } = validationResult.data;
    const normalizedCurrent = decoded.email; // Use email from JWT token
    const normalizedNew = newEmail.trim().toLowerCase();

    const user = await isUserExist(normalizedCurrent);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Verify OTP that was sent to the new email
    await verifyOTP(user.id, normalizedNew, otpCode, "email_change");

    // Perform the change
    await changeUserEmail(normalizedCurrent, normalizedNew);

    logger.info(
      `Email changed after OTP verification: ${normalizedCurrent} -> ${normalizedNew}`,
    );

    return res.status(200).json({
      message: "Email changed successfully",
    });
  } catch (error) {
    logger.error("Verify email change failed:", error);

    // Handle specific error cases
    if (error.message === "Invalid or expired OTP") {
      return res.status(400).json({
        error: "Invalid or expired OTP",
        message:
          "The OTP you entered is invalid or has expired. Please request a new one.",
      });
    }
    if (error.message === "OTP has expired") {
      return res.status(400).json({
        error: "OTP expired",
        message: "The OTP has expired. Please request a new one.",
      });
    }
    if (error.message === "Maximum verification attempts exceeded") {
      return res.status(429).json({
        error: "Too many attempts",
        message:
          "You've exceeded the maximum number of attempts. Please request a new OTP.",
      });
    }
    if (error.message === "Invalid OTP code") {
      return res.status(400).json({
        error: "Invalid OTP",
        message:
          "The OTP code you entered is incorrect. Please check and try again.",
      });
    }
    if (error.message === "User does not exist") {
      return res.status(404).json({
        error: "User not found",
        message: "User account not found. Please sign in again.",
      });
    }
    if (error.message === "Email already in use") {
      return res.status(409).json({
        error: "Email already in use",
        message:
          "This email is already registered with another account. Please use a different email.",
      });
    }
    if (error.message.includes("Login with")) {
      return res.status(400).json({
        error: "Social login account",
        message: "Cannot change email for social login accounts.",
      });
    }

    return res.status(500).json({
      error: "Email change failed",
      message:
        "Something went wrong while changing your email. Please try again.",
    });
  }
};

/**
 * Resend OTP
 */
export const resendOTPCode = async (req, res) => {
  try {
    const validationResult = resendOTPSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: "validation failed",
        details: formatValidationsError(validationResult.error),
      });
    }

    const { email, purpose } = validationResult.data;

    // Check if user exists
    const user = await isUserExist(email);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Resend OTP
    const result = await resendOTP(user.id, email, purpose);

    logger.info(
      `OTP resent successfully for user: ${email}, purpose: ${purpose}`,
    );
    return res.status(200).json({
      message: "OTP resent successfully",
      expiresIn: result.expiresIn,
    });
  } catch (error) {
    logger.error("Resend OTP failed:", error);
    return res.status(500).json({ error: "Failed to resend OTP" });
  }
};

/**
 * Get OTP status
 */
export const getOTPStatusController = async (req, res) => {
  try {
    // Verify JWT token first
    const decoded = req.auth; // Assuming auth middleware sets this
    if (!decoded) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    const validationResult = getOTPStatusSchema.safeParse(req.query);

    if (!validationResult.success) {
      return res.status(400).json({
        error: "validation failed",
        details: formatValidationsError(validationResult.error),
      });
    }

    const { purpose } = validationResult.data;

    // Get OTP status
    const status = await getOTPStatus(decoded.id, purpose);

    return res.status(200).json({
      status,
    });
  } catch (error) {
    logger.error("Get OTP status failed:", error);
    return res.status(500).json({ error: "Failed to get OTP status" });
  }
};

/**
 * Test email configuration
 */
export const testEmailConfig = async (req, res) => {
  try {
    const result = await testEmailConfiguration();

    // Show current email configuration
    const emailFromName = process.env.EMAIL_FROM_NAME || "no-replay@Fluxo.io";
    const emailUser = process.env.EMAIL_USER || "Not set";
    const emailService = process.env.EMAIL_SERVICE || "gmail";

    logger.info("Email configuration test successful");
    return res.status(200).json({
      message: "Email configuration is working correctly",
      success: true,
      configuration: {
        fromName: emailFromName,
        fromAddress: `${emailFromName} <${emailUser}>`,
        authUser: emailUser,
        service: emailService,
        displayFormat: `${emailFromName} <${emailUser}>`,
      },
    });
  } catch (error) {
    logger.error("Email configuration test failed:", error);
    return res.status(500).json({
      error: "Email configuration test failed",
      details: error.message,
    });
  }
};

/**
 * Cleanup expired OTPs (admin utility)
 */
export const cleanupOTPs = async (req, res) => {
  try {
    // This could be protected by admin middleware in the future
    const result = await cleanupExpiredOTPs();

    logger.info(
      `OTP cleanup completed: ${result.deletedCount} expired OTPs removed`,
    );
    return res.status(200).json({
      message: "Expired OTPs cleaned up successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    logger.error("OTP cleanup failed:", error);
    return res.status(500).json({ error: "Failed to cleanup OTPs" });
  }
};

// forgot password

/**
 * Request password reset OTP
 */
export const forgotPassword = async (req, res) => {
  try {
    // Validate request body
    const validationResult = forgotPasswordSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: "Enter a Valid Email",
        details: formatValidationsError(validationResult.error),
      });
    }

    const { email } = validationResult.data;

    const user = await isUserExist(email);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const result = await generateAndStoreOTP(user.id, email, "password_reset");
    if (!result?.success) {
      return res.status(400).json({ error: result.message });
    }

    logger.info(`Password reset OTP sent to email: ${email}`);
    return res.status(200).json({
      message: "Password reset OTP sent successfully",
      expiresIn: result.expiresIn,
    });
  } catch (error) {
    logger.error("Forgot password failed:", error);

    // Handle specific error cases
    if (error.message.includes("Email configuration")) {
      return res.status(503).json({
        error: "Email service unavailable",
        message: "We're having trouble sending emails. Please try again later.",
      });
    }
    if (error.message.includes("User not found")) {
      return res.status(404).json({
        error: "User not found",
        message:
          "No account found with this email. Please check your email or sign up.",
      });
    }

    return res.status(500).json({
      error: "Password reset request failed",
      message:
        "Something went wrong while requesting password reset. Please try again.",
    });
  }
};

// verify password reset OTP

/**
 * Step 1: Verify OTP only (returns success if valid)
 */
export const verifyPasswordResetOTP = async (req, res) => {
  try {
    // Validate request body
    const validationResult = verifyPasswordResetOTPSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: "validation failed",
        details: formatValidationsError(validationResult.error),
      });
    }

    const { email, otpCode } = validationResult.data;

    const normalizedEmail = email.trim().toLowerCase();
    const user = await isUserExist(normalizedEmail);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Verify OTP only
    await verifyOTP(user.id, normalizedEmail, otpCode, "password_reset");
    console.log("otp verifed successfull");

    console.log("reset token generated 1");
    // Generate a short-lived reset token (5 minutes)
    const resetToken = await jwttoken.sign(
      {
        id: user.id,
        email: normalizedEmail,
        purpose: "password_reset",
      },
      { expiresIn: "5m" },
    );

    console.log("reset token generated 2");
    logger.info(
      `Password reset OTP verified successfully for user: ${normalizedEmail}`,
    );
    return res.status(200).json({
      message: "OTP verified successfully. You can now reset your password.",
      verified: true,
      resetToken: resetToken,
    });
  } catch (error) {
    logger.error("Verify password reset OTP failed:", error);

    // Handle specific error cases
    if (error.message === "Invalid or expired OTP") {
      return res.status(400).json({
        error: "Invalid or expired OTP",
        message:
          "The OTP you entered is invalid or has expired. Please request a new one.",
      });
    }
    if (error.message === "OTP has expired") {
      return res.status(400).json({
        error: "OTP expired",
        message: "The OTP has expired. Please request a new one.",
      });
    }
    if (error.message === "Maximum verification attempts exceeded") {
      return res.status(429).json({
        error: "Too many attempts",
        message:
          "You've exceeded the maximum number of attempts. Please request a new OTP.",
      });
    }
    if (error.message === "Invalid OTP code") {
      return res.status(400).json({
        error: "Invalid OTP",
        message:
          "The OTP code you entered is incorrect. Please check and try again.",
      });
    }
    if (error.message === "User does not exist") {
      return res.status(404).json({
        error: "User not found",
        message:
          "No account found with this email. Please check your email or sign up.",
      });
    }

    return res.status(500).json({
      error: "OTP verification failed",
      message:
        "Something went wrong while verifying the OTP. Please try again.",
    });
  }
};

/**
 * Step 2: Reset password (requires valid reset token from step 1)
 */
export const resetPassword = async (req, res) => {
  try {
    // Validate request body
    const validationResult = resetPasswordSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: "validation failed",
        details: formatValidationsError(validationResult.error),
      });
    }

    const { resetToken, newPassword } = validationResult.data;

    // Verify the reset token
    const decoded = jwttoken.verify(resetToken);
    if (!decoded || decoded.purpose !== "password_reset") {
      return res.status(401).json({ error: "Invalid or expired reset token" });
    }

    const normalizedEmail = decoded.email;
    const user = await isUserExist(normalizedEmail);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Reset password
    await resetUserPassword(normalizedEmail, newPassword);

    logger.info(`Password reset successfully for user: ${normalizedEmail}`);
    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    logger.error("Reset password failed:", error);

    // Handle specific error cases
    if (error.message === "User does not exist") {
      return res.status(404).json({
        error: "User not found",
        message: "User account not found. Please request a new password reset.",
      });
    }
    if (error.message.includes("Login with")) {
      return res.status(400).json({
        error: "Social login account",
        message:
          "Cannot reset password for social login accounts. Please use the social login provider to manage your password.",
      });
    }
    if (error.message.includes("Invalid or expired")) {
      return res.status(401).json({
        error: "Invalid or expired reset token",
        message:
          "The reset token is invalid or has expired. Please request a new password reset.",
      });
    }

    return res.status(500).json({
      error: "Password reset failed",
      message:
        "Something went wrong while resetting your password. Please try again.",
    });
  }
};
