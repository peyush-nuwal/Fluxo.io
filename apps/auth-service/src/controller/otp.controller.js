import logger from "../config/logger.js";
import { isUserExist } from "../service/auth.service.js";
import {
  generateAndStoreOTP,
  verifyOTP,
  resendOTP,
  getOTPStatus,
  cleanupExpiredOTPs,
  testEmailConfiguration,
} from "../service/otp.service.js";
import { markEmailAsVerified } from "../service/auth.service.js";
import { formatValidationsError } from "../utils/format.js";
import {
  generateOTPSchema,
  verifyOTPSchema,
  resendOTPSchema,
  getOTPStatusSchema,
} from "../../../../packages/zod-schemas/index.js";

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

    logger.info(`OTP generated successfully for user: ${email}, purpose: ${purpose}`);
    return res.status(200).json({
      message: "OTP sent successfully",
      expiresIn: result.expiresIn,
    });
  } catch (error) {
    logger.error("Generate OTP failed:", error);
    return res.status(500).json({ error: "Failed to generate OTP" });
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
      logger.info(`Email verified successfully for user: ${email}`);
    }

    logger.info(`OTP verified successfully for user: ${email}, purpose: ${purpose}`);
    return res.status(200).json({
      message: "OTP verified successfully",
      emailVerified: purpose === "email_verification",
    });
  } catch (error) {
    logger.error("Verify OTP failed:", error);

    // Handle specific error cases
    if (error.message === "Invalid or expired OTP") {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }
    if (error.message === "OTP has expired") {
      return res.status(400).json({ error: "OTP has expired" });
    }
    if (error.message === "Maximum verification attempts exceeded") {
      return res.status(429).json({ error: "Maximum verification attempts exceeded" });
    }
    if (error.message === "Invalid OTP code") {
      return res.status(400).json({ error: "Invalid OTP code" });
    }

    return res.status(500).json({ error: "Failed to verify OTP" });
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

    logger.info(`OTP resent successfully for user: ${email}, purpose: ${purpose}`);
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
    const emailUser = process.env.EMAIL_USER || 'Not set';
    const emailService = process.env.EMAIL_SERVICE || 'gmail';
    
    logger.info("Email configuration test successful");
    return res.status(200).json({
      message: "Email configuration is working correctly",
      success: true,
      configuration: {
        fromName: emailFromName,
        fromAddress: `${emailFromName} <${emailUser}>`,
        authUser: emailUser,
        service: emailService,
        displayFormat: `${emailFromName} <${emailUser}>`
      }
    });
  } catch (error) {
    logger.error("Email configuration test failed:", error);
    return res.status(500).json({ 
      error: "Email configuration test failed",
      details: error.message 
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

    logger.info(`OTP cleanup completed: ${result.deletedCount} expired OTPs removed`);
    return res.status(200).json({
      message: "Expired OTPs cleaned up successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    logger.error("OTP cleanup failed:", error);
    return res.status(500).json({ error: "Failed to cleanup OTPs" });
  }
};
