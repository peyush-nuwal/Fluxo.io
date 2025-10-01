import logger from "../config/logger.js";
import {
  authenticateUser,
  createUser,
  changeUserPassword,
} from "../service/auth.service.js";
import { cookies } from "../utils/cookie.js";
import { formatValidationsError } from "../utils/format.js";
import { jwttoken } from "../utils/jwt.js";
import {
  signInSchema,
  signUpSchema,
  changePasswordSchema,
} from "../../../../packages/zod-schemas/index.js";

// controllers/auth.controller.js
//next  removed next parem ;
export const signUp = async (req, res) => {
  try {
    const validationResult = signUpSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: "validation failed",
        details: formatValidationsError(validationResult.error),
      });
    }

    const { name, email, password } = validationResult.data;

    //Auth service
    const user = await createUser({ name, email, password });

    // creating jwt token
    const token = await jwttoken.sign({
      id: user.id,
      email: user.email,
    });

    //setting cookie
    cookies.set(res, "token", token);

    logger.info(`User register successfully with email: ${email}`);
    return res.status(201).json({
      message: "User registered",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    logger.error("sign up failed", error);
    if (error.message === "User already exists") {
      return res.status(409).json({ error: "User already exists" });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
};

// sign in user
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

    const token = await jwttoken.sign({
      id: user.id,
      email: user.email,
    });

    cookies.set(res, "token", token);

    return res.status(200).json({
      message: "Sign in success",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    if (error.message === "User does not exist") {
      return res.status(404).json({ error: "User does not exist" });
    }
    if (error.message === "Invalid credentials") {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const signOut = (req, res) => {
  try {
    // Clear the auth cookie
    cookies.clear(res, "token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    logger.info("User signed out successfully");
    return res.status(200).json({ message: "User signed out successfully" });
  } catch (error) {
    logger.error("Error during sign out:", error);
    return res
      .status(500)
      .json({ error: "Internal server error during sign out" });
  }
};

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

    logger.info(`Password changed successfully for user: ${userEmail}`);
    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    logger.error("Error changing password:", error);

    // Handle specific error cases
    if (error.message === "User does not exist") {
      return res.status(404).json({ error: "User not found" });
    }
    if (error.message === "Invalid credentials") {
      return res.status(401).json({ error: "Current password is incorrect" });
    }
    if (error.message.includes("Login with")) {
      return res
        .status(400)
        .json({ error: "Cannot change password for social login accounts" });
    }

    return res
      .status(500)
      .json({ error: "Internal server error while changing password" });
  }
};
