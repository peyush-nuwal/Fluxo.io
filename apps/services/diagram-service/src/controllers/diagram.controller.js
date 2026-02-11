import logger from "../config/logger.js";
import {
  createDiagramSchema,
  updateDiagramSchema,
} from "../../../../../packages/zod-schemas/index.js";

import {
  verifyProjectOwnership,
  verifyDiagramOwnership,
  toggleLikes,
  getLikeCount,
  createDiagram,
  updateDiagram,
  getPublicDiagramById,
  incrementDiagramViews,
  softDeleteDiagram,
  restoreDiagram,
  getDiagramsByUser,
  getUserDiagramById,
  setDiagramVisibility,
  hardDeleteUserDiagram,
  updateDiagramLastOpened,
  getDiagramByProject,
} from "../services/diagram.service.js";

/* ===================== PROJECT ===================== */

export const getDiagramsByProjectController = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { projectId } = req.params;
    if (!projectId) {
      return res.status(400).json({ error: "Project ID is required" });
    }

    const project = await verifyProjectOwnership(projectId, userId);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const diagrams = await getDiagramByProject(userId, projectId);
    return res.status(200).json({ diagrams });
  } catch (error) {
    logger.error("Error getting diagrams by project:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/* ===================== USER DIAGRAMS ===================== */

export const getAllDiagramsByUserController = async (req, res) => {
  try {
    const userId = req.user?.id;
    const userEmail = req.user?.email;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const defaultOwnerUsername = userEmail
      ? userEmail.split("@")[0]
      : "unknown-user";

    const diagrams = await getDiagramsByUser(userId, {
      owner_name: null,
      owner_username: defaultOwnerUsername,
      owner_avatar_url: null,
    });
    return res.status(200).json({ diagrams });
  } catch (error) {
    logger.error("Error getting diagrams by user:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/* ===================== SINGLE DIAGRAM ===================== */

export const getDiagramByIdController = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { diagramId } = req.params;

    const diagram = await getUserDiagramById(userId, diagramId);
    if (!diagram) {
      return res.status(404).json({ error: "Diagram not found" });
    }

    updateDiagramLastOpened(diagramId).catch(() => {});
    incrementDiagramViews(diagramId).catch(() => {});

    return res.status(200).json({ diagram });
  } catch (error) {
    logger.error("Error getting diagram by id:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/* ===================== PUBLIC DIAGRAM ===================== */

export const getPublicDiagramController = async (req, res) => {
  try {
    const { diagramId } = req.params;

    const diagram = await getPublicDiagramById(diagramId);
    if (!diagram) {
      return res.status(404).json({ error: "Diagram not found" });
    }

    updateDiagramLastOpened(diagramId).catch(() => {});
    incrementDiagramViews(diagramId).catch(() => {});

    return res.status(200).json({ diagram });
  } catch (error) {
    logger.error("Error getting public diagram:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/* ===================== CREATE / UPDATE ===================== */

export const createDiagramController = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const {
      name,
      data,
      projectId,
      description,
      thumbnail_url,
      owner_name,
      owner_username,
      owner_avatar_url,
    } = createDiagramSchema.parse(req.body);

    const normalizedName =
      typeof name === "string" && name.trim().length > 0 ? name.trim() : null;

    const diagram = await createDiagram({
      userId,
      projectId: projectId ?? null,
      name: normalizedName,
      data: data ?? {
        nodes: [],
        edges: [],
        viewport: { x: 0, y: 0, zoom: 1 },
      },
      description,
      thumbnail_url,
      owner_name,
      owner_username,
      owner_avatar_url,
    });

    return res.status(201).json({ diagram });
  } catch (error) {
    logger.error("Error creating diagram:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const updateDiagramController = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { diagramId } = req.params;

    const diagram = await getUserDiagramById(userId, diagramId);
    if (!diagram) {
      return res.status(404).json({ error: "Diagram not found" });
    }

    const updateData = updateDiagramSchema.parse(req.body);
    const updatedDiagram = await updateDiagram(diagramId, updateData);

    return res.status(200).json({ diagram: updatedDiagram });
  } catch (error) {
    logger.error("Error updating diagram:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/* ===================== DELETE / RESTORE ===================== */

export const softDeleteDiagramController = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { diagramId } = req.params;

    const diagram = await verifyDiagramOwnership(userId, diagramId);
    if (!diagram) {
      return res.status(404).json({ error: "Diagram not found" });
    }

    await softDeleteDiagram(userId, diagramId);
    return res.status(204).send();
  } catch (error) {
    logger.error("Error soft deleting diagram:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const hardDeleteUserDiagramController = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { diagramId } = req.params;

    const diagram = await verifyDiagramOwnership(userId, diagramId);
    if (!diagram) {
      return res.status(404).json({ error: "Diagram not found" });
    }

    await hardDeleteUserDiagram(userId, diagramId);
    return res.status(204).send();
  } catch (error) {
    logger.error("Error hard deleting diagram:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const restoreDiagramController = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { diagramId } = req.params;

    const diagram = await verifyDiagramOwnership(userId, diagramId);
    if (!diagram) {
      return res.status(404).json({ error: "Diagram not found" });
    }

    const restored = await restoreDiagram(userId, diagramId);
    return res.status(200).json({
      message: "Diagram restored",
      diagramId: restored.id,
    });
  } catch (error) {
    logger.error("Error restoring diagram:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/* ===================== LIKES ===================== */

export const handleDiagramLikes = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { diagramId } = req.params;
    const result = await toggleLikes(diagramId, userId);

    return res.status(200).json({
      diagramId,
      ...result,
    });
  } catch (error) {
    logger.error("Error toggling like:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getDiagramLikesCount = async (req, res) => {
  try {
    const { diagramId } = req.params;
    const likes = await getLikeCount(diagramId);

    return res.status(200).json({ diagramId, likes });
  } catch (error) {
    logger.error("Error getting like count:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/* ===================== VISIBILITY ===================== */

export const updateDiagramVisibilityController = async (req, res) => {
  try {
    const { diagramId } = req.params;
    const { isPublic } = req.body;

    if (typeof isPublic !== "boolean") {
      return res.status(400).json({ error: "isPublic must be boolean" });
    }

    const diagram = await setDiagramVisibility(diagramId, isPublic);
    if (!diagram) {
      return res.status(404).json({ error: "Diagram not found" });
    }

    return res.status(200).json({ diagram });
  } catch (error) {
    logger.error("Error updating diagram visibility:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
