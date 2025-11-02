import { db } from "../config/database.js";
import { and, eq, isNull, or, sql } from "drizzle-orm";
import logger from "../config/logger.js";
import projectsTable from "../models/project.model.js";
import {
  createProjectSchema,
  updateProjectSchema,
  ZodError,
} from "../../../../../packages/zod-schemas/index.js";
import { verifyProjectOwnership } from "../services/project.service.js";

export const getAllProjects = async (req, res) => {
  try {
    const userId = req.user?.id;
    const userEmail = req.user?.email;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    // Filter for projects owned by the user
    const ownerFilter = and(
      eq(projectsTable.user_id, userId),
      isNull(projectsTable.deleted_at),
    );

    // Filter for projects where user is a collaborator (by email)
    // Since collaborators array stores emails, we check if user's email is in the array
    const normalizedUserEmail = userEmail?.trim().toLowerCase();
    const collabFilter = normalizedUserEmail
      ? and(
          sql`${projectsTable.collaborators}::jsonb @> ${JSON.stringify([normalizedUserEmail])}::jsonb`,
          isNull(projectsTable.deleted_at),
        )
      : null;

    // Include both owned projects and collaborative projects
    const whereClause = collabFilter
      ? or(ownerFilter, collabFilter)
      : ownerFilter;

    const rows = await db.select().from(projectsTable).where(whereClause);

    return res.status(200).json({ projects: rows });
  } catch (error) {
    logger.error("Error getting all projects:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const createProject = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    // Validate request body with Zod
    let validatedData;
    try {
      validatedData = createProjectSchema.parse(req.body);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: "Validation error",
          details: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        });
      }
      throw error;
    }

    const { title, description, thumbnail_url } = validatedData;

    const [newProject] = await db
      .insert(projectsTable)
      .values({
        user_id: userId,
        title,
        description,
        thumbnail_url,
        is_public: false,
        collaborators: [],
      })
      .returning({
        id: projectsTable.id,
        title: projectsTable.title,
        description: projectsTable.description,
        thumbnail_url: projectsTable.thumbnail_url,
        created_at: projectsTable.created_at,
      });
    logger.info(`Project ${newProject.title} created successfully`);

    return res.status(201).json({ project: newProject });
  } catch (error) {
    logger.error("Error creating project:", error);
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: "Validation error",
        details: error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { id } = req.params;

    // Verify project ownership
    const project = await verifyProjectOwnership(id, userId);

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    return res.status(200).json({ project });
  } catch (error) {
    logger.error("Error getting project by id:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const updateProject = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { id: projectId } = req.params;

    if (!projectId)
      return res.status(400).json({ error: "Project ID is required" });

    // Validate request body with Zod
    let validatedData;
    try {
      validatedData = updateProjectSchema.parse(req.body);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: "Validation error",
          details: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        });
      }
      throw error;
    }

    const { title, description, thumbnail_url, is_public, collaborators } =
      validatedData;

    // Verify project ownership
    const project = await verifyProjectOwnership(projectId, userId);

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Build update object with only provided fields
    const updateFields = {
      updated_at: new Date(),
    };
    if (title !== undefined) updateFields.title = title;
    if (description !== undefined) updateFields.description = description;
    if (thumbnail_url !== undefined) updateFields.thumbnail_url = thumbnail_url;
    if (is_public !== undefined) updateFields.is_public = is_public;
    if (collaborators !== undefined) updateFields.collaborators = collaborators;

    const [updated_project] = await db
      .update(projectsTable)
      .set(updateFields)
      .where(
        and(
          eq(projectsTable.id, projectId),
          eq(projectsTable.user_id, userId),
          isNull(projectsTable.deleted_at),
        ),
      )
      .returning({
        id: projectsTable.id,
        title: projectsTable.title,
        description: projectsTable.description,
        thumbnail_url: projectsTable.thumbnail_url,
        is_public: projectsTable.is_public,
        collaborators: projectsTable.collaborators,
        updated_at: projectsTable.updated_at,
      });

    if (!updated_project)
      return res.status(404).json({ error: "Project not found" });

    return res.status(200).json({ project: updated_project });
  } catch (error) {
    logger.error("Error updating project:", error);
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: "Validation error",
        details: error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { id: projectId } = req.params;

    // Verify project ownership
    const project = await verifyProjectOwnership(projectId, userId);

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const [deleted_project] = await db
      .delete(projectsTable)
      .where(
        and(
          eq(projectsTable.id, projectId),
          eq(projectsTable.user_id, userId),
          isNull(projectsTable.deleted_at),
        ),
      )
      .returning({ id: projectsTable.id });

    if (!deleted_project)
      return res.status(404).json({ error: "Project not found" });

    return res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    logger.error("Error deleting project:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
