import nodemailer from "nodemailer";
import { v4 as uuidv4 } from "uuid";
import logger from "../config/logger.js";
import { db } from "../config/database.js";
import { eq, and, lt } from "drizzle-orm";
import otps from "../models/otp.model.js";

// OTP configuration
const OTP_EXPIRY_MINUTES = 10; // OTP expires in 10 minutes
const MAX_ATTEMPTS = 3; // Maximum verification attempts
const OTP_LENGTH = 6; // 6-digit OTP

/**
 * Generate a random OTP with configurable length
 */
const generateOTP = () => {
  const min = Math.pow(10, OTP_LENGTH - 1);
  const max = Math.pow(10, OTP_LENGTH) - 1;
  return Math.floor(min + Math.random() * (max - min + 1)).toString();
};

/**
 * Create nodemailer transporter
 */
const createTransporter = () => {
  // Check if required environment variables are set
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    throw new Error("Email configuration missing: EMAIL_USER and EMAIL_PASSWORD are required");
  }

  const config = {
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    // Add name field to make it look more professional
    from: {
      name: process.env.EMAIL_FROM_NAME || "Fluxo.io",
      address: process.env.EMAIL_USER
    }
  };

  logger.info(`Creating email transporter with service: ${config.service}, user: ${config.auth.user}`);
  return nodemailer.createTransport(config);
};

/**
 * Send OTP email
 */
export const sendOTPEmail = async (email, otpCode, purpose = "verification") => {
  try {
    const transporter = createTransporter();

    const subjectMap = {
      email_verification: "Email Verification Code",
      password_reset: "Password Reset Code",
      login: "Login Verification Code",
      two_factor: "Two-Factor Authentication Code",
    };

    const subject = subjectMap[purpose] || "Verification Code";
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">${subject}</h2>
        <p>Your verification code is:</p>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">${otpCode}</h1>
        </div>
        <p>This code will expire in ${OTP_EXPIRY_MINUTES} minutes.</p>
        <p style="color: #666; font-size: 14px;">
          If you didn't request this code, please ignore this email.
        </p>
      </div>
    `;

    const mailOptions = {
      from: {
        name: process.env.EMAIL_FROM_NAME || "Fluxo.io",
        address: process.env.EMAIL_USER
      },
      to: email,
      subject: subject,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    logger.info(`OTP email sent successfully to ${email} for purpose: ${purpose}`);
    
    return { success: true, message: "OTP sent successfully" };
  } catch (error) {
    logger.error("Error sending OTP email:", {
      error: error.message,
      code: error.code,
      response: error.response,
      stack: error.stack
    });
    
    // Provide more specific error messages
    if (error.code === 'EAUTH') {
      throw new Error("Email authentication failed. Please check your email credentials.");
    } else if (error.code === 'ECONNECTION') {
      throw new Error("Failed to connect to email service. Please check your internet connection.");
    } else if (error.code === 'ETIMEDOUT') {
      throw new Error("Email service connection timed out. Please try again.");
    } else {
      throw new Error(`Failed to send OTP email: ${error.message}`);
    }
  }
};

/**
 * Generate and store OTP in database
 */
export const generateAndStoreOTP = async (userId, email, purpose = "email_verification") => {
  try {
    // Check for existing unused OTPs for this user and purpose
    const existingOTP = await db
      .select()
      .from(otps)
      .where(
        and(
          eq(otps.user_id, userId),
          eq(otps.purpose, purpose),
          eq(otps.is_used, false),
          lt(new Date(), otps.expires_at) // Not expired
        )
      )
      .limit(1);

    let otpCode;
    let otpId;

    if (existingOTP.length > 0) {
      // Use existing valid OTP
      otpCode = existingOTP[0].otp_code;
      otpId = existingOTP[0].id;
      logger.info(`Using existing OTP for user ${userId}, purpose: ${purpose}`);
    } else {
      // Generate new OTP
      otpCode = generateOTP();
      otpId = uuidv4();
      
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + OTP_EXPIRY_MINUTES);

      // Store new OTP in database
      await db.insert(otps).values({
        id: otpId,
        user_id: userId,
        email: email,
        otp_code: otpCode,
        purpose: purpose,
        expires_at: expiresAt,
        is_used: false,
        attempts: 0,
      });

      logger.info(`New OTP generated and stored for user ${userId}, purpose: ${purpose}`);
    }

    // Send OTP via email
    await sendOTPEmail(email, otpCode, purpose);

    return {
      success: true,
      message: "OTP generated and sent successfully",
      expiresIn: OTP_EXPIRY_MINUTES * 60, // seconds
    };
  } catch (error) {
    logger.error("Error generating and storing OTP:", error);
    throw new Error("Failed to generate OTP");
  }
};

/**
 * Verify OTP code
 */
export const verifyOTP = async (userId, email, otpCode, purpose = "email_verification") => {
  try {
    // Find the OTP record
    const [otpRecord] = await db
      .select()
      .from(otps)
      .where(
        and(
          eq(otps.user_id, userId),
          eq(otps.email, email),
          eq(otps.purpose, purpose),
          eq(otps.is_used, false)
        )
      )
      .limit(1);

    if (!otpRecord) {
      throw new Error("Invalid or expired OTP");
    }

    // Check if OTP is expired
    if (new Date() > new Date(otpRecord.expires_at)) {
      throw new Error("OTP has expired");
    }

    // Check if maximum attempts exceeded
    if (otpRecord.attempts >= MAX_ATTEMPTS) {
      throw new Error("Maximum verification attempts exceeded");
    }

    // Increment attempts counter
    await db
      .update(otps)
      .set({ attempts: otpRecord.attempts + 1 })
      .where(eq(otps.id, otpRecord.id));

    // Verify OTP code
    if (otpRecord.otp_code !== otpCode) {
      logger.warn(`Invalid OTP attempt for user ${userId}, purpose: ${purpose}`);
      throw new Error("Invalid OTP code");
    }

    // Mark OTP as used
    await db
      .update(otps)
      .set({ 
        is_used: true, 
        used_at: new Date() 
      })
      .where(eq(otps.id, otpRecord.id));

    logger.info(`OTP verified successfully for user ${userId}, purpose: ${purpose}`);
    return {
      success: true,
      message: "OTP verified successfully",
    };
  } catch (error) {
    logger.error("Error verifying OTP:", error);
    throw error; // Re-throw to let controller handle specific error messages
  }
};

/**
 * Resend OTP (invalidates previous OTP and generates new one)
 */
export const resendOTP = async (userId, email, purpose = "email_verification") => {
  try {
    // Mark any existing unused OTPs as used
    await db
      .update(otps)
      .set({ is_used: true })
      .where(
        and(
          eq(otps.user_id, userId),
          eq(otps.purpose, purpose),
          eq(otps.is_used, false)
        )
      );

    // Generate and store new OTP
    return await generateAndStoreOTP(userId, email, purpose);
  } catch (error) {
    logger.error("Error resending OTP:", error);
    throw new Error("Failed to resend OTP");
  }
};

/**
 * Test email configuration
 */
export const testEmailConfiguration = async () => {
  try {
    const transporter = createTransporter();
    
    // Test connection
    await transporter.verify();
    logger.info("Email configuration test successful");
    
    return {
      success: true,
      message: "Email configuration is working correctly"
    };
  } catch (error) {
    logger.error("Email configuration test failed:", error);
    throw new Error(`Email configuration test failed: ${error.message}`);
  }
};

/**
 * Clean up expired OTPs (utility function for maintenance)
 */
export const cleanupExpiredOTPs = async () => {
  try {
    const result = await db
      .delete(otps)
      .where(lt(otps.expires_at, new Date()));

    logger.info(`Cleaned up expired OTPs: ${result.rowCount} records deleted`);
    return { success: true, deletedCount: result.rowCount };
  } catch (error) {
    logger.error("Error cleaning up expired OTPs:", error);
    throw new Error("Failed to cleanup expired OTPs");
  }
};

/**
 * Get OTP status for a user
 */
export const getOTPStatus = async (userId, purpose = "email_verification") => {
  try {
    const [otpRecord] = await db
      .select()
      .from(otps)
      .where(
        and(
          eq(otps.user_id, userId),
          eq(otps.purpose, purpose),
          eq(otps.is_used, false)
        )
      )
      .limit(1);

    if (!otpRecord) {
      return { hasActiveOTP: false };
    }

    const isExpired = new Date() > new Date(otpRecord.expires_at);
    const remainingAttempts = MAX_ATTEMPTS - otpRecord.attempts;
    const expiresAt = new Date(otpRecord.expires_at);

    return {
      hasActiveOTP: !isExpired,
      isExpired,
      remainingAttempts,
      expiresAt,
      attempts: otpRecord.attempts,
    };
  } catch (error) {
    logger.error("Error getting OTP status:", error);
    throw new Error("Failed to get OTP status");
  }
};
