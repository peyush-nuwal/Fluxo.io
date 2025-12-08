import { db } from "../config/database.js";
import { and, eq, isNull } from "drizzle-orm";
import logger from "../config/logger.js";
import { diagrams } from "../models/index.model.js";
import {
  createDiagramSchema,
  updateDiagramSchema,
  ZodError,
} from "../../../../../packages/zod-schemas/index.js";
import {
  verifyProjectOwnership,
  verifyDiagramOwnership,
  toggleLikes,
  getLikeCount,
} from "../services/diagram.service.js";

export const getDiagramsByProject = async (req, res) => {
  try {
    let userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { projectId } = req.params;
    if (!projectId)
      return res.status(400).json({ error: "Project ID is required" });

    // First verify the project belongs to the user
    const project = await verifyProjectOwnership(projectId, userId);

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Then get diagrams for this project
    const rows = await db
      .select()
      .from(diagrams)
      .where(
        and(eq(diagrams.project_id, projectId), isNull(diagrams.deleted_at)),
      );

    // Return empty array if no diagrams found (not an error)
    return res.status(200).json({ diagrams: rows });
  } catch (error) {
    logger.error("Error getting diagrams by project:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const createDiagram = async (req, res) => {
  try {
    let userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { projectId } = req.params;
    if (!projectId)
      return res.status(400).json({ error: "Project ID is required" });

    // First verify the project belongs to the user
    const project = await verifyProjectOwnership(projectId, userId);

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Validate request body with Zod
    let validatedData;
    try {
      validatedData = createDiagramSchema.parse(req.body);
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

    const { name, data } = validatedData;

    // Initialize empty React Flow diagram if no data provided
    const diagramData = data || {
      nodes: [],
      edges: [],
      viewport: { x: 0, y: 0, zoom: 1 },
    };

    const [newDiagram] = await db
      .insert(diagrams)
      .values({
        project_id: projectId,
        name: name,
        data: diagramData,
      })
      .returning({
        id: diagrams.id,
        name: diagrams.name,
        data: diagrams.data,
      });

    logger.info(`Diagram ${newDiagram.name} created successfully`);
    return res.status(201).json({ diagram: newDiagram });
  } catch (error) {
    logger.error("Error creating diagram:", error);
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

export const updateDiagram = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { id, projectId } = req.params;
    if (!id) return res.status(400).json({ error: "Diagram ID is required" });
    if (!projectId)
      return res.status(400).json({ error: "Project ID is required" });

    // Verify diagram ownership (verifies project and diagram)
    const diagram = await verifyDiagramOwnership(id, projectId, userId);

    if (!diagram) {
      return res.status(404).json({ error: "Diagram not found" });
    }

    // Validate request body with Zod
    let validatedData;
    try {
      validatedData = updateDiagramSchema.parse(req.body);
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

    const { name, data, is_active } = validatedData;

    // Build update object with only provided fields
    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (data !== undefined) updateFields.data = data;
    if (is_active !== undefined) updateFields.is_active = is_active;
    updateFields.updated_at = new Date(); // Update timestamp

    const [updatedDiagram] = await db
      .update(diagrams)
      .set(updateFields)
      .where(
        and(
          eq(diagrams.id, id),
          eq(diagrams.project_id, projectId),
          isNull(diagrams.deleted_at),
        ),
      )
      .returning({
        id: diagrams.id,
        name: diagrams.name,
        data: diagrams.data,
        is_active: diagrams.is_active,
        updated_at: diagrams.updated_at,
      });

    if (!updatedDiagram)
      return res.status(404).json({ error: "Diagram not found" });

    return res.status(200).json({ diagram: updatedDiagram });
  } catch (error) {
    logger.error("Error updating diagram:", error);
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

export const deleteDiagram = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { id, projectId } = req.params;
    if (!id) return res.status(400).json({ error: "Diagram ID is required" });
    if (!projectId)
      return res.status(400).json({ error: "Project ID is required" });

    // Verify diagram ownership (verifies project and diagram)
    const diagram = await verifyDiagramOwnership(id, projectId, userId);

    if (!diagram) {
      return res.status(404).json({ error: "Diagram not found" });
    }

    const deletedDiagram = await db
      .delete(diagrams)
      .where(
        and(
          eq(diagrams.id, id),
          eq(diagrams.project_id, projectId),
          isNull(diagrams.deleted_at),
        ),
      )
      .returning();

    if (!deletedDiagram || deletedDiagram.length === 0)
      return res.status(404).json({ error: "Diagram not found" });

    return res.status(200).json({ message: "Diagram deleted successfully" });
  } catch (error) {
    logger.error("Error deleting diagram:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const handleDiagramLikes = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const { diagramId } = req.params;

    if (!diagramId) {
      return res.status(400).json({ error: "Diagram ID is required" });
    }
    const likeResult = await toggleLikes(diagramId, userId);

    const action = likeResult.liked ? "liked" : "unliked";

    logger.info(`User ${userId} ${action} diagram ${diagramId}`);

    return res.status(200).json({
      diagramId,
      ...likeResult,
      message: `Diagram ${action} successfully`,
    });
  } catch (error) {
    logger.error("Failed to toggle diagram like");
    console.error(error);

    return res.status(500).json({ error: "Something went wrong" });
  }
};

export const getDiagramLikesCount = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const { diagramId } = req.params;

    if (!diagramId) {
      return res.status(400).json({ error: "Diagram ID is required" });
    }

    const likesCount = await getLikeCount(diagramId);
    logger.info(`diagram: ${diagramId} have ${likesCount} likes`);

    return res.status(200).json({
      diagramId,
      likes: likesCount,
    });
  } catch (error) {
    logger.error("Failed to retrive like count");
    console.error(error);

    return res
      .status(500)
      .json({ error: "Something went wrong  while getting likes count " });
  }
};
