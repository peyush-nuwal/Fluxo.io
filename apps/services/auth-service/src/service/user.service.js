import { and, eq, sql } from "drizzle-orm";
import { db } from "../config/database.js";
import { users } from "../models/index.model.js";

export const changeProfileVisibility = async (userId, isPublic = false) => {
  return await db
    .update(users)
    .set({ is_profile_public: isPublic, updated_at: new Date() })
    .where(eq(users.id, userId))
    .returning({ id: users.id });
};

export const getUserProfileById = async (userId) => {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      userId: true,
      name: true,
      user_name: true,
      avatar_url: true,
      email: true,
      email_verified: true,
      is_profile_public: true,
      metadata: true,
      created_at: true,
      updated_at: true,
      // add more personal fields here
    },
  });

  return user; // User | null
};

export const getPublicUserProfileById = async (userId) => {
  return db.query.users.findFirst({
    where: and(eq(users.id, userId), eq(users.is_profile_public, true)),
    columns: {
      userId: true,
      name: true,
      user_name: true,
      avatar_url: true,
      metadata: true,
    },
  });
};

export const updateUserProfile = async (userId, payload) => {
  const updateData = {};

  // top-level fields
  if (payload.name !== undefined) updateData.name = payload.name;
  if (payload.user_name !== undefined) updateData.user_name = payload.user_name;
  if (payload.avatar_url !== undefined)
    updateData.avatar_url = payload.avatar_url;

  // metadata fields (merge-safe)
  if (
    payload.bio !== undefined ||
    payload.location !== undefined ||
    payload.website !== undefined ||
    payload.work !== undefined
  ) {
    updateData.metadata = sql`
      jsonb_set(
        ${users.metadata},
        '{}',
        (${users.metadata} || ${JSON.stringify({
          bio: payload.bio,
          location: payload.location,
          website: payload.website,
          work: payload.work,
        })})::jsonb
      )
    `;
  }

  if (Object.keys(updateData).length === 0) return null;

  return db
    .update(users)
    .set(updateData)
    .where(eq(users.id, userId))
    .returning({
      id: users.id,
      name: users.name,
      user_name: users.user_name,
      avatar_url: users.avatar_url,
    });
};

// export const updateUserProfile = async (userId, payload) => {
//

//   // remove undefined keys
// ;

//
// };
