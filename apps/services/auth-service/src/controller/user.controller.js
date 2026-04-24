import logger from "../config/logger.js";

import {
  changeProfileVisibility,
  getUsersByEmails,
  getPublicUserProfileById,
  getUserProfileById,
  updateUserProfile,
  updateUserUsername,
} from "../service/user.service.js";
import { users } from "../models/index.model.js";
import { eq } from "drizzle-orm";
import { db } from "../config/database.js";
import { uploadAvatar } from "../service/avatar.service.js";
import {
  getUsersByEmailsSchema,
  updateUsernameSchema,
  updateUserProfileSchema,
} from "../../../../../packages/zod-schemas/index.js";
import { isUsernameExist } from "../service/auth.service.js";
import { formatValidationsError } from "../utils/format.js";
import { sendError, sendSuccess } from "../utils/response.js";

export const changeProfileVisibilityController = async (req, res) => {
  const userId = req.user?.id;

  if (!userId) return sendError(res, 401, "Invalid or missing token");

  try {
    const { make_public } = req.body;
    const isPublic = Boolean(make_public);

    const updatedUsers = await changeProfileVisibility(userId, isPublic);

    if (updatedUsers.length === 0) {
      return sendError(res, 404, "User not found");
    }

    return sendSuccess(res, 200, "Profile visibility updated", {
      is_profile_public: isPublic,
    });
  } catch (error) {
    logger.error("Failed while changing user profile visibility", error);
    return sendError(res, 500, "Failed to update profile visibility");
  }
};

export const uploadAvatarController = async (req, res) => {
  const userId = req.user?.id;

  if (!userId) return sendError(res, 401, "Unauthorized");

  try {
    const file = req.file;
    if (!file) return sendError(res, 400, "No file uploaded");

    const avatar = await uploadAvatar(userId, file);

    await db
      .update(users)
      .set({ avatar_url: avatar.url, updated_at: new Date() })
      .where(eq(users.id, userId));

    logger.info("Avatar uploaded successfully");

    return sendSuccess(res, 200, "Avatar uploaded successfully", {
      avatarUrl: avatar.url,
    });
  } catch (error) {
    logger.error("Avatar upload failed", error);
    return sendError(res, 500, "Avatar upload failed");
  }
};

export const getUserProfile = async (req, res) => {
  const userId = req.user?.id;

  if (!userId) return sendError(res, 401, "Unauthorized");

  try {
    const user = await getUserProfileById(userId);

    if (!user) return sendError(res, 404, "User not found");

    logger.info({ userId }, "User profile fetched");

    return sendSuccess(res, 200, "User profile fetched", { user });
  } catch (error) {
    logger.error({ err: error, userId }, "Failed to fetch user profile");
    return sendError(res, 500, "Failed getting user profile");
  }
};

export const getUserPublicProfile = async (req, res) => {
  const userId = req.params?.id;

  if (!userId) return sendError(res, 401, "Unauthorized");

  try {
    const user = await getPublicUserProfileById(userId);

    if (!user) return sendError(res, 404, "User not found");

    logger.info({ userId }, "User public profile fetched");

    return sendSuccess(res, 200, "User public profile fetched", { user });
  } catch (error) {
    logger.error({ err: error, userId }, "Failed to fetch user public profile");
    return sendError(res, 500, "Failed getting user public profile");
  }
};

export const updateUserProfileController = async (req, res) => {
  const userId = req.user?.id;

  if (!userId) return sendError(res, 401, "Unauthorized");

  try {
    const parsed = updateUserProfileSchema.safeParse(req.body);

    if (!parsed.success) {
      return sendError(res, 400, "Invalid request body", {
        errors: formatValidationsError(parsed.error),
      });
    }

    const payload = { ...parsed.data };

    // Username update
    if (parsed.data.user_name) {
      const normalizedUsername = parsed.data.user_name.trim().toLowerCase();

      const exists = await isUsernameExist(normalizedUsername, userId);
      if (exists) {
        return sendError(res, 409, "Username already exists");
      }

      payload.user_name = normalizedUsername;
    }

    // Avatar upload (optional)
    if (req.file) {
      const uploadResult = await uploadAvatar(userId, req.file);
      payload.avatar_url = uploadResult.url;
    }

    if (Object.keys(payload).length === 0) {
      return sendError(res, 400, "Nothing to update");
    }

    const updatedUser = await updateUserProfile(userId, payload);

    return sendSuccess(res, 200, "Profile updated successfully", {
      user: updatedUser,
    });
  } catch (error) {
    logger.error({ err: error, userId }, "Failed updating user profile");
    return sendError(res, 500, "Failed updating user profile");
  }
};

export const getUsersByEmailsController = async (req, res) => {
  try {
    const expectedToken = process.env.INTERNAL_SERVICE_TOKEN;
    const incomingToken = req.headers["x-internal-service-token"];

    if (
      !expectedToken ||
      typeof incomingToken !== "string" ||
      incomingToken !== expectedToken
    ) {
      return sendError(res, 403, "Forbidden");
    }

    const parsed = getUsersByEmailsSchema.safeParse(req.body);

    if (!parsed.success) {
      return sendError(res, 400, "Invalid request body", {
        errors: formatValidationsError(parsed.error),
      });
    }

    const usersList = await getUsersByEmails(parsed.data.emails);

    return sendSuccess(res, 200, "Users fetched successfully", {
      users: usersList,
    });
  } catch (error) {
    logger.error({ err: error }, "Failed fetching users by emails");
    return sendError(res, 500, "Failed to fetch users");
  }
};

export const updateUsernameController = async (req, res) => {
  const userId = req.user?.id;

  if (!userId) return sendError(res, 401, "Unauthorized");

  try {
    const parsed = updateUsernameSchema.safeParse(req.body);

    if (!parsed.success) {
      return sendError(res, 400, "Invalid request body", {
        errors: formatValidationsError(parsed.error),
      });
    }

    const normalizedUsername = parsed.data.user_name.trim().toLowerCase();
    const exists = await isUsernameExist(normalizedUsername, userId);

    if (exists) {
      return sendError(res, 409, "Username already exists");
    }

    const updatedUser = await updateUserUsername(userId, normalizedUsername);

    if (!updatedUser) {
      return sendError(res, 404, "User not found");
    }

    return sendSuccess(res, 200, "Username updated successfully", {
      user: updatedUser,
    });
  } catch (error) {
    logger.error({ err: error, userId }, "Failed updating username");
    return sendError(res, 500, "Failed updating username");
  }
};
