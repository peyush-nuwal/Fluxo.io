import logger from "../config/logger.js";

import {
  changeProfileVisibility,
  getPublicUserProfileById,
  getUserProfileById,
  updateUserProfile,
} from "../service/user.service.js";
import { users } from "../models/index.model.js";
import { eq } from "drizzle-orm";
import { db } from "../config/database.js";
import { uploadAvatar } from "../service/avatar.service.js";
import { updateUserProfileSchema } from "../../../../../packages/zod-schemas/index.js";
import { isUsernameExist } from "../service/auth.service.js";
import { formatValidationsError } from "../utils/format.js";

export const changeProfileVisibilityController = async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: "Invalid or missing token" });
  }

  try {
    const { make_public } = req.body;

    // normalize boolean (important)
    const isPublic = Boolean(make_public);

    const updatedUsers = await changeProfileVisibility(userId, isPublic);

    if (updatedUsers.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "Profile visibility updated",
      is_profile_public: isPublic,
    });
  } catch (error) {
    logger.error("Failed while changing user profile visibility", error);

    return res.status(500).json({
      message: "Failed to update profile visibility",
    });
  }
};

export const uploadAvatarController = async (req, res) => {
  const userId = req.user.id;

  console.log("user id -------", userId);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  try {
    console.log("request file ", req.file);
    const file = req.file;

    if (!file) return res.status(400).json({ error: "No file uploaded" });

    const avatar = await uploadAvatar(userId, file);

    // updating avatar url in neon db
    await db
      .update(users)
      .set({ avatar_url: avatar.url, updated_at: new Date() })
      .where(eq(users.id, userId));

    logger.info("file uploaded successfully");
    res.json({ success: true, avatarUrl: avatar.url });
  } catch (error) {
    logger.error("avatar upload failed ", error);
    console.error(error);
    res.status(500).json({ error: "Avatar upload failed" });
  }
};

export const getUserProfile = async (req, res) => {
  const userId = req.user.id;

  if (!userId) {
    return res
      .status(401)
      .json({ message: "Unauthorized not getting user id" });
  }

  try {
    const user = await getUserProfileById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    logger.info({ userId }, "User profile fetched");

    return res.status(200).json(user);
  } catch (error) {
    logger.error({ err: error, userId }, "Failed to fetch user profile");

    return res.status(500).json({
      message: "Failed to get user profile",
    });
  }
};

export const getUserPublicProfile = async (req, res) => {
  const userId = req.params?.id; // set by auth middleware

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const user = await getPublicUserProfileById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    logger.info({ userId }, "User public profile fetched");

    return res.status(200).json(user);
  } catch (error) {
    logger.error({ err: error, userId }, "Failed to fetch user public profile");

    return res.status(500).json({
      message: "Failed to get user public profile",
    });
  }
};

export const updateUserProfileController = async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const parsed = updateUserProfileSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid request body",
        errors: formatValidationsError(parsed.error),
      });
    }

    const payload = { ...parsed.data };

    // ✅ Username update (only if provided)
    if (parsed.data.user_name) {
      const normalizedUsername = parsed.data.user_name.trim().toLowerCase();

      const exists = await isUsernameExist(normalizedUsername, userId);
      if (exists) {
        return res.status(409).json({
          message: "Username already exists",
        });
      }

      payload.user_name = normalizedUsername;
    }

    // ✅ Avatar upload (optional)
    if (req.file) {
      const uploadResult = await uploadAvatar(userId, req.file);
      payload.avatar_url = uploadResult.url;
    }

    if (Object.keys(payload).length === 0) {
      return res.status(400).json({ message: "Nothing to update" });
    }

    const updatedUser = await updateUserProfile(userId, payload);

    return res.status(200).json({
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    logger.error({ err: error, userId }, "Failed updating user profile");

    return res.status(500).json({
      message: "Failed updating user profile",
    });
  }
};
