import { db } from "../config/database.js";
import { and, eq, isNull } from "drizzle-orm";
import logger from "../config/logger.js";

import { projects } from "../models/index.model.js";

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
