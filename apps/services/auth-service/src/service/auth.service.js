import bcrypt from "bcrypt";
import logger from "../config/logger.js";
import { db } from "../config/database.js";
import { eq } from "drizzle-orm";
import { users } from "../models/index.model.js";
import { v4 as uuidv4 } from "uuid";
import { getOTPStatus, verifyOTP } from "./otp.service.js";

// ========================================
// Configuration
// ========================================
const SALT_ROUNDS = 10;

// ========================================
// Password Utilities
// ========================================

/**
 * Hash a plain text password using bcrypt
 */
export const hashPassword = async (password) => {
  try {
    return await bcrypt.hash(password, SALT_ROUNDS);
  } catch (err) {
    logger.error("Error hashing password:", err);
    throw new Error("Internal server error while hashing password");
  }
};

/**
 * Compare a plain text password with a bcrypt hash
 */
export const comparePassword = async (password, hash) => {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    logger.error("Error comparing password:", error);
    throw new Error("Internal server error while verifying password");
  }
};

// ========================================
// User Management
// ========================================

/**
 * Check if a user exists by email
 * @returns user object if found, otherwise null
 */
export const isUserExist = async (email) => {
  try {
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return existingUser || null;
  } catch (error) {
    logger.error("Error checking if user exists:", error);
    throw new Error("Internal server error while checking user exists");
  }
};

/**
 * Create User in database
 */
export const createUser = async ({
  user_name,
  name,
  email,
  password,
  google_id = null,
  github_id = null,
  auth_provider = "local",
  email_verified = false,
}) => {
  try {
    // Reuse isUserExist
    const existingUser = await isUserExist(email);

    if (existingUser) {
      throw new Error("User already exists");
    }

    // hashing password (only for local auth)
    const hashed_password = password ? await hashPassword(password) : null;

    // creating user if not exists
    const [newUser] = await db
      .insert(users)
      .values({
        id: uuidv4(),
        name,
        user_name,
        email,
        password: hashed_password,
        auth_provider,
        google_id,
        github_id,
        email_verified: auth_provider === "local" ? email_verified : true,
      })
      .returning({
        id: users.id,
        user_name: users.user_name,
        name: users.name,
        email: users.email,
        auth_provider: users.auth_provider,
        email_verified: users.email_verified,
        created_at: users.created_at,
      });

    logger.info(`User ${newUser.email} created successfully`);
    return newUser;
  } catch (error) {
    logger.error("Error creating user:", error);
    if (error.message === "User already exists") {
      throw error; // preserve specific error
    }
    throw new Error("Internal server error while creating user");
  }
};

// ========================================
// Authentication
// ========================================

/**
 * Authenticate user with email and password
 */
export const authenticateUser = async (email, password) => {
  const user = await isUserExist(email);

  if (!user) throw new Error("User does not exist");

  if (user.auth_provider !== "local") {
    throw new Error(`Login with ${user.auth_provider}`);
  }

  const isPasswordCorrect = await comparePassword(password, user.password);

  if (!isPasswordCorrect) throw new Error("Invalid credentials");

  return user; // controller decides what to do with it
};

// ========================================
// Password Management
// ========================================

/**
 * Change user password
 */
export const changeUserPassword = async (email, oldPassword, newPassword) => {
  try {
    const user = await isUserExist(email);
    if (!user) throw new Error("User does not exist");

    if (user.auth_provider !== "local") {
      throw new Error(`Login with ${user.auth_provider}`);
    }

    const isPasswordCorrect = await comparePassword(oldPassword, user.password);
    if (!isPasswordCorrect) throw new Error("Invalid credentials");

    const hashed_password = await hashPassword(newPassword);
    await db
      .update(users)
      .set({ password: hashed_password })
      .where(eq(users.email, email));

    logger.info(`Password changed for user ${email}`);
    return { message: "Password changed successfully" };
  } catch (error) {
    logger.error("Error changing password:", error);

    // Preserve specific error messages for controller to handle
    if (
      error.message === "User does not exist" ||
      error.message === "Invalid credentials" ||
      error.message.includes("Login with")
    ) {
      throw error; // Let controller handle these specific errors
    }

    // Only wrap unexpected errors
    throw new Error("Internal server error while changing password");
  }
};

// ========================================
// Email Verification
// ========================================

/**
 * Mark email as verified
 */
export const markEmailAsVerified = async (userId) => {
  try {
    await db
      .update(users)
      .set({ email_verified: true })
      .where(eq(users.id, userId));

    logger.info(`Email verified for user ${userId}`);

    return { success: true, message: "Email verified successfully" };
  } catch (error) {
    logger.error("Error marking email as verified:", error);
    throw new Error("Internal server error while verifying email");
  }
};

// ========================================
// Email Management
// ========================================

/**
 * Change user email
 */
export const changeUserEmail = async (email, newEmail) => {
  try {
    const normalizedCurrent = email.trim().toLowerCase();
    const normalizedNew = newEmail.trim().toLowerCase();

    const user = await isUserExist(normalizedCurrent);
    if (!user) throw new Error("User does not exist");

    if (user.auth_provider !== "local") {
      throw new Error(`Login with ${user.auth_provider}`);
    }

    // Ensure new email not already taken
    const newEmailUser = await isUserExist(normalizedNew);
    if (newEmailUser) {
      throw new Error("Email already in use");
    }

    await db
      .update(users)
      .set({ email: normalizedNew })
      .where(eq(users.email, normalizedCurrent));

    logger.info(
      `Email changed for user ${normalizedCurrent} -> ${normalizedNew}`,
    );
    return { message: "Email changed successfully" };
  } catch (error) {
    logger.error("Error changing email:", error);
    if (
      error.message === "User does not exist" ||
      error.message === "Email already in use" ||
      (typeof error.message === "string" &&
        error.message.startsWith("Login with"))
    ) {
      throw error;
    }
    throw new Error("Internal server error while changing email");
  }
};

/**
 * Reset user password (for forgot password flow)
 */
export const resetUserPassword = async (email, newPassword) => {
  try {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await isUserExist(normalizedEmail);
    if (!user) throw new Error("User does not exist");

    if (user.auth_provider !== "local") {
      throw new Error(`Login with ${user.auth_provider}`);
    }

    const hashedPassword = await hashPassword(newPassword);
    await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.email, normalizedEmail));

    logger.info(`Password reset for user ${normalizedEmail}`);
    return { message: "Password reset successfully" };
  } catch (error) {
    logger.error("Error resetting password:", error);
    if (
      error.message === "User does not exist" ||
      (typeof error.message === "string" &&
        error.message.startsWith("Login with"))
    ) {
      throw error;
    }
    throw new Error("Internal server error while resetting password");
  }
};

// verify user email
export const verifyUserEmail = async (email) => {
  try {
    const user = await isUserExist(email);
    if (!user) {
      return {
        success: false,
        code: "USER_NOT_FOUND",
        message: "User does not exist",
      };
    }

    if (user.auth_provider !== "local") {
      return {
        success: false,
        code: "VERIFICATION_NOT_APPLICABLE",
        message: "Email verification not required",
      };
    }

    if (user.email_verified) {
      // idempotent success: no-op
      return {
        success: true,
        code: "ALREADY_VERIFIED",
        message: "Email already verified",
      };
    }

    const otpStatus = await getOTPStatus(user.id, "email_verification");

    if (otpStatus.isExpired) {
      return {
        success: false,
        code: "OTP_EXPIRED",
        message: "Email verification OTP has expired",
      };
    }

    if (otpStatus.hasActiveOTP) {
      return {
        success: false,
        code: "OTP_ACTIVE",
        message: "Email verification OTP is active",
      };
    }
    if (otpStatus.remainingAttempts <= 0) {
      return {
        success: false,
        code: "OTP_MAX_ATTEMPTS",
        message:
          "Email verification OTP has reached the maximum number of attempts",
      };
    }
    if (otpStatus.attempts >= otpStatus.remainingAttempts) {
      return {
        success: false,
        code: "OTP_MAX_ATTEMPTS",
        message:
          "Email verification OTP has reached the maximum number of attempts",
      };
    }

    const result = await verifyOTP(
      user.id,
      user.email,
      otpStatus.otp_code,
      "email_verification",
    );
    if (!result?.success) {
      return {
        success: false,
        code: "VERIFY_INTERNAL_ERROR",
        message: "Unable to verify email at this time",
      };
    }

    return {
      success: true,
      code: "VERIFIED",
      message: "Email verified successfully",
    };
  } catch (err) {
    logger.error("Error verifying user email", {
      error: err?.message,
      stack: err?.stack,
    });
    return {
      success: false,
      code: "VERIFY_UNEXPECTED_ERROR",
      message: "Unable to verify email at this time",
    };
  }
};

// Authenticate or create OAuth user
export const authenticateOAuthUser = async (profile, provider) => {
  const email = profile.emails[0].value;
  let user = await isUserExist(email);

  if (!user) {
    // Create OAuth user
    user = await createUser({
      name: profile.displayName || profile.username,
      email,
      password: null,
      auth_provider: provider,
      google_id: provider === "google" ? profile.id : null,
      github_id: provider === "github" ? profile.id : null,
      email_verified: true,
    });
  } else if (user.auth_provider !== provider) {
    throw new Error(`Login with ${user.auth_provider}`);
  }

  return user; // Controller or route generates JWT
};

export const isUsernameExist = async (username) => {
  const user = await db.query.users.findFirst({
    where: eq(users.user_name, username),
    columns: { id: true }, // fetch minimal data
  });

  return Boolean(user);
};
