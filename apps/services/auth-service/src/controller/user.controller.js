import logger from "../config/logger.js";

import { changeProfileVisibility } from "../service/user.service.js";
import { users } from "../models/index.model.js";
import { eq } from "drizzle-orm";
import { db } from "../config/database.js";
import { uploadAvatar } from "../service/avatar.service.js";

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
  console.log("HEADERS:", req.headers);
  console.log("USER ID HEADER:", req.headers["x-user-id"]);

  const userId = req.headers["x-user-id"];

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
      .set({ avatar_url: avatar.url })
      .where(eq(users.id, userId));

    logger.info("file uploaded successfully");
    res.json({ success: true, avatarUrl: avatar.url });
  } catch (error) {
    logger.error("avatar upload failed ", error);
    console.error(error);
    res.status(500).json({ error: "Avatar upload failed" });
  }
};
