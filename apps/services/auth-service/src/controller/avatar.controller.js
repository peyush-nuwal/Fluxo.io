import { uploadAvatar } from "../service/avatar.service.js";

import users from "../models/user.model.js";
import { eq } from "drizzle-orm";
import { db } from "../config/database.js";
import logger from "../../../../api-gateway/src/config/logger.js";

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
