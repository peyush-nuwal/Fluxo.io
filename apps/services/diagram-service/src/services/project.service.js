import { db } from "../config/database.js";
import { and, eq, isNull, or, sql } from "drizzle-orm";
import logger from "../config/logger.js";
import { supabase } from "../config/supabase.js";

import { projects } from "../models/index.model.js";
import crypto from "crypto";

const THUMBNAIL_BUCKET = process.env.SUPABASE_THUMBNAIL_BUCKET || "thumbnail";

const projectSelectFields = {
  id: projects.id,
  title: projects.title,
  description: projects.description,
  thumbnail_url: projects.thumbnail_url,
  is_public: projects.is_public,
  collaborators: projects.collaborators,
  owner_name: projects.owner_name,
  owner_username: projects.owner_username,
  owner_avatar_url: projects.owner_avatar_url,
  created_at: projects.created_at,
  updated_at: projects.updated_at,
};

export const getProjectsByUser = async (userId, userEmail) => {
  const ownerFilter = and(
    eq(projects.user_id, userId),
    isNull(projects.deleted_at),
  );

  const normalizedUserEmail = userEmail?.trim().toLowerCase();
  const collabFilter = normalizedUserEmail
    ? and(
        sql`${projects.collaborators}::jsonb @> ${JSON.stringify([normalizedUserEmail])}::jsonb`,
        isNull(projects.deleted_at),
      )
    : null;

  const whereClause = collabFilter
    ? or(ownerFilter, collabFilter)
    : ownerFilter;

  let rows = await db.select().from(projects).where(whereClause);

  if (rows.length === 0) {
    await createDefaultProject({
      userId,
      owner_name: null,
      owner_username: userEmail ? userEmail.split("@")[0] : null,
      owner_avatar_url: null,
    });

    rows = await db.select().from(projects).where(whereClause);
  }

  return rows;
};

export async function createDefaultProject({
  userId,
  owner_name,
  owner_username,
  owner_avatar_url,
}) {
  let [project] = await db
    .select()
    .from(projects)
    .where(
      and(
        eq(projects.user_id, userId),
        eq(projects.is_default, true),
        isNull(projects.deleted_at),
      ),
    );

  if (project) return project;

  return createProject({
    userId: userId,
    title: "My Workspace",
    description: null,
    thumbnail_url: null,
    is_default: true,
    owner_name: owner_name ?? null,
    owner_username: owner_username ?? null,
    owner_avatar_url: owner_avatar_url ?? null,
  });
}

export const createProject = async ({
  userId,
  title,
  description,
  thumbnail_url,
  is_default,
  owner_name,
  owner_username,
  owner_avatar_url,
}) => {
  const [newProject] = await db
    .insert(projects)
    .values({
      user_id: userId,
      title,
      description,
      thumbnail_url,
      is_default,
      is_public: false,
      collaborators: [],
      owner_name,
      owner_username,
      owner_avatar_url,
    })
    .returning(projectSelectFields);

  return newProject;
};

export const updateProjectById = async (userId, projectId, updateData) => {
  const [updatedProject] = await db
    .update(projects)
    .set({
      ...updateData,
      updated_at: new Date(),
    })
    .where(
      and(
        eq(projects.id, projectId),
        eq(projects.user_id, userId),
        isNull(projects.deleted_at),
      ),
    )
    .returning(projectSelectFields);

  return updatedProject ?? null;
};

export const deleteProjectById = async (userId, projectId) => {
  const [deletedProject] = await db
    .delete(projects)
    .where(
      and(
        eq(projects.id, projectId),
        eq(projects.user_id, userId),
        isNull(projects.deleted_at),
      ),
    )
    .returning({ id: projects.id });

  return deletedProject ?? null;
};

export const verifyProjectOwnership = async (projectId, userId) => {
  try {
    const [project] = await db
      .select()
      .from(projects)
      .where(
        and(
          eq(projects.id, projectId),
          eq(projects.user_id, userId),
          isNull(projects.deleted_at),
        ),
      );
    if (!project) {
      throw new Error("Project not found");
    }
    if (project.user_id !== userId) {
      throw new Error("Unauthorized");
    }
    return project;
  } catch (error) {
    logger.error("Error verifying project ownership:", error);
    return null;
  }
};

export const addCollaboratorToProject = async (
  projectId,
  collaboratorEmail,
) => {
  try {
    const [project] = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, projectId), isNull(projects.deleted_at)));

    if (!project) {
      return null;
    }

    // Normalize email
    const normalizedEmail = collaboratorEmail.trim().toLowerCase();

    // Get current collaborators array
    const collaborators = project.collaborators || [];

    // Check if collaborator already exists (case-insensitive)
    const normalizedCollaborators = collaborators.map((email) =>
      email.toLowerCase(),
    );
    if (normalizedCollaborators.includes(normalizedEmail)) {
      return { ...project, collaborators };
    }

    // Add new collaborator email
    const updatedCollaborators = [...collaborators, normalizedEmail];

    const [updatedProject] = await db
      .update(projects)
      .set({
        collaborators: updatedCollaborators,
        updated_at: new Date(),
      })
      .where(eq(projects.id, projectId))
      .returning();

    return updatedProject;
  } catch (error) {
    logger.error("Error adding collaborator to project:", error);
    return null;
  }
};

export const removeCollaboratorFromProject = async (
  projectId,
  collaboratorEmail,
) => {
  try {
    const [project] = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, projectId), isNull(projects.deleted_at)));

    if (!project) {
      return null;
    }

    // Normalize email
    const normalizedEmail = collaboratorEmail.trim().toLowerCase();

    // Get current collaborators array
    const collaborators = project.collaborators || [];

    // Remove collaborator if exists (case-insensitive comparison)
    const updatedCollaborators = collaborators.filter(
      (email) => email.toLowerCase() !== normalizedEmail,
    );

    const [updatedProject] = await db
      .update(projects)
      .set({
        collaborators: updatedCollaborators,
        updated_at: new Date(),
      })
      .where(eq(projects.id, projectId))
      .returning();

    return updatedProject;
  } catch (error) {
    logger.error("Error removing collaborator from project:", error);
    return null;
  }
};

export const uploadThumbnail = async (userId, file) => {
  const ext = file.originalname?.split(".").pop() || "png";
  const fileName = `${crypto.randomUUID()}.${ext}`;
  const filePath = `${userId}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(THUMBNAIL_BUCKET)
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: true,
    });

  if (uploadError) throw uploadError;

  const { data: publicData } = supabase.storage
    .from(THUMBNAIL_BUCKET)
    .getPublicUrl(filePath);

  return {
    url: publicData.publicUrl,
    path: filePath,
  };
};
