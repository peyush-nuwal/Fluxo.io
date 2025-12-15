import { eq } from "drizzle-orm";
import { db } from "../config/database.js";
import { users } from "../models/index.model.js";

export const changeProfileVisibility = async (userId, isPublic = false) => {
  return await db
    .update(users)
    .set({ is_profile_public: isPublic })
    .where(eq(users.id, userId))
    .returning({ id: users.id });
};
