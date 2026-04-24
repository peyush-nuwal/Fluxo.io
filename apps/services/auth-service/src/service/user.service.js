import { and, eq, inArray, sql } from "drizzle-orm";
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
  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      user_name: users.user_name,
      avatar_url: users.avatar_url,
      email: users.email,
      email_verified: users.email_verified,
      auth_provider: users.auth_provider,
      has_password: sql`${users.password} is not null`,
      is_profile_public: users.is_profile_public,
      metadata: users.metadata,
      created_at: users.created_at,
      updated_at: users.updated_at,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return user; // User | null
};

export const getPublicUserProfileById = async (userId) => {
  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      user_name: users.user_name,
      avatar_url: users.avatar_url,
      metadata: users.metadata,
    })
    .from(users)
    .where(and(eq(users.id, userId), eq(users.is_profile_public, true)))
    .limit(1);

  return user ?? null;
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

export const updateUserUsername = async (userId, username) => {
  const [updatedUser] = await db
    .update(users)
    .set({ user_name: username, updated_at: new Date() })
    .where(eq(users.id, userId))
    .returning({
      id: users.id,
      name: users.name,
      user_name: users.user_name,
      avatar_url: users.avatar_url,
      email: users.email,
      email_verified: users.email_verified,
      metadata: users.metadata,
    });

  return updatedUser ?? null;
};

export const getUsersByEmails = async (emails = []) => {
  const normalizedEmails = [
    ...new Set(
      emails
        .filter((email) => typeof email === "string" && email.trim())
        .map((email) => email.trim().toLowerCase()),
    ),
  ];

  if (normalizedEmails.length === 0) {
    return [];
  }

  return db
    .select({
      email: users.email,
      user_name: users.user_name,
      avatar_url: users.avatar_url,
    })
    .from(users)
    .where(inArray(users.email, normalizedEmails));
};

// export const updateUserProfile = async (userId, payload) => {
//

//   // remove undefined keys
// ;

//
// };
