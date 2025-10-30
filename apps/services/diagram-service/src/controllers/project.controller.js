import { db } from "../config/database.js";
import { and, eq, isNull, or, sql } from "drizzle-orm";
import logger from "../config/logger.js";
import projectsTable from "../models/project.model.js";
import {
  createProjectSchema,
  updateProjectSchema,
} from "../../../../../packages/zod-schemas/index.js";

export const getAllProjects = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const ownerFilter = and(
      eq(projectsTable.user_id, userId),
      isNull(projectsTable.deleted_at),
    );

    const includeCollaborations = false;
    const collabFilter = sql`${projectsTable.collaborators}::jsonb @> ${JSON.stringify([userId])}::jsonb`;

    const whereClause = includeCollaborations
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

    const { title, description, thumbnail_url } = createProjectSchema.parse(
      req.body,
    );

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
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { id } = req.params;

    const rows = await db
      .select()
      .from(projectsTable)
      .where(
        and(
          eq(projectsTable.id, id),
          eq(projectsTable.user_id, userId),
          isNull(projectsTable.deleted_at),
        ),
      );

    if (rows.length === 0)
      return res.status(404).json({ error: "Project not found" });

    return res.status(200).json({ project: rows[0] });
  } catch (error) {
    logger.error("Error getting project by id:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const updateProject = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { title, description, thumbnail_url, is_public, collaborators } =
      updateProjectSchema.parse(req.body);
    const { id: projectId } = req.params;

    if (!projectId)
      return res.status(400).json({ error: "Project ID is required" });

    const [updated_project] = await db
      .update(projectsTable)
      .set({
        title,
        description,
        thumbnail_url,
        is_public,
        collaborators,
      })
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
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteProject = async (req, res) => {
  try {
    let userId = req.user?.id;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { id: projectId } = req.params;

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
