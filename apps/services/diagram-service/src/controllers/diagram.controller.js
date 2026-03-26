import logger from "../config/logger.js";
import {
  createDiagramSchema,
  setDiagramActiveSchema,
  updateDiagramSchema,
  ZodError,
} from "../../../../../packages/zod-schemas/index.js";
import { uploadThumbnail } from "../services/project.service.js";
import {
  verifyProjectAccess,
  toggleLikes,
  getLikeCount,
  createDiagram,
  updateDiagram,
  getPublicDiagramById,
  incrementDiagramViews,
  softDeleteDiagram,
  restoreDiagram,
  getDiagramsByUser,
  getDiagramById,
  getUserDiagramById,
  getSoftDeletedUserDiagramById,
  setDiagramVisibility,
  hardDeleteUserDiagram,
  updateDiagramLastOpened,
  getDiagramByProject,
  getAllSoftDeletedDiagramByUser,
  verifyDiagramOwnership,
} from "../services/diagram.service.js";
import {
  normalizeOptionalText,
  normalizeUpdateName,
  normalizeOptionalBoolean,
} from "../utils/helper.js";
import { getUploadedThumbnail } from "./file.controller.js";
import { formatZodDetails, sendError, sendSuccess } from "../utils/response.js";

/* ===================== PROJECT ===================== */

export const getDiagramsByProjectController = async (req, res) => {
  try {
    const userId = req.user?.id;
    const userEmail = req.user?.email;
    if (!userId) return sendError(res, 401, "Unauthorized");

    const { projectId } = req.params;
    if (!projectId) {
      return sendError(res, 400, "Project ID is required");
    }

    const project = await verifyProjectAccess(projectId, userId, userEmail);
    if (!project) {
      return sendError(res, 404, "Project not found");
    }

    const diagrams = await getDiagramByProject(projectId);
    return sendSuccess(res, 200, "Project diagrams fetched successfully", {
      diagrams,
    });
  } catch (error) {
    logger.error("Error getting diagrams by project:", error);
    return sendError(res, 500, "Failed to fetch project diagrams");
  }
};

/* ===================== USER DIAGRAMS ===================== */

export const getAllDiagramsByUserController = async (req, res) => {
  try {
    const userId = req.user?.id;
    const userEmail = req.user?.email;
    if (!userId) return sendError(res, 401, "Unauthorized");

    const defaultOwnerUsername = userEmail
      ? userEmail.split("@")[0]
      : "unknown-user";

    const diagrams = await getDiagramsByUser(userId, userEmail, {
      owner_name: null,
      owner_username: defaultOwnerUsername,
      owner_avatar_url: null,
    });
    return sendSuccess(res, 200, "Diagrams fetched successfully", {
      diagrams,
    });
  } catch (error) {
    logger.error("Error getting diagrams by user:", error);
    return sendError(res, 500, "Failed to fetch diagrams");
  }
};

/* ===================== SINGLE DIAGRAM ===================== */

export const getDiagramByIdController = async (req, res) => {
  try {
    const userId = req.user?.id;
    const userEmail = req.user?.email;
    if (!userId) return sendError(res, 401, "Unauthorized");

    const { diagramId } = req.params;

    let diagram = await getUserDiagramById(userId, diagramId);

    // Allow collaborators to open diagrams that belong to projects shared with them.
    if (!diagram) {
      const candidate = await getDiagramById(diagramId);
      if (!candidate) {
        return sendError(res, 404, "Diagram not found");
      }

      const canAccessSharedProject =
        candidate.project_id &&
        (await verifyProjectAccess(candidate.project_id, userId, userEmail));

      if (!canAccessSharedProject) {
        return sendError(res, 404, "Diagram not found");
      }

      diagram = candidate;
    }

    updateDiagramLastOpened(diagramId).catch(() => {});
    incrementDiagramViews(diagramId).catch(() => {});

    return sendSuccess(res, 200, "Diagram fetched successfully", { diagram });
  } catch (error) {
    logger.error("Error getting diagram by id:", error);
    return sendError(res, 500, "Failed to fetch diagram");
  }
};

/* ===================== PUBLIC DIAGRAM ===================== */

export const getPublicDiagramController = async (req, res) => {
  try {
    const { diagramId } = req.params;

    const diagram = await getPublicDiagramById(diagramId);
    if (!diagram) {
      return sendError(res, 404, "Diagram not found");
    }

    updateDiagramLastOpened(diagramId).catch(() => {});
    incrementDiagramViews(diagramId).catch(() => {});

    return sendSuccess(res, 200, "Diagram fetched successfully", { diagram });
  } catch (error) {
    logger.error("Error getting public diagram:", error);
    return sendError(res, 500, "Failed to fetch public diagram");
  }
};

/* ===================== CREATE / UPDATE ===================== */

export const createDiagramController = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return sendError(res, 401, "Unauthorized");

    const uploadedThumbnail = getUploadedThumbnail(req);
    if (
      uploadedThumbnail &&
      !uploadedThumbnail.mimetype?.startsWith("image/")
    ) {
      return sendError(res, 400, "Thumbnail must be an image file");
    }

    const normalizedPayload = {
      name: normalizeOptionalText(req.body?.name),
      data: req.body?.data,
      projectId: normalizeOptionalText(req.body?.projectId),
      description: normalizeOptionalText(req.body?.description),
      thumbnail_url: normalizeOptionalText(req.body?.thumbnail_url),
      owner_name: normalizeOptionalText(req.body?.owner_name),
      owner_username: normalizeOptionalText(req.body?.owner_username),
      owner_avatar_url: normalizeOptionalText(req.body?.owner_avatar_url),
    };

    if (uploadedThumbnail?.buffer) {
      try {
        const uploadResult = await uploadThumbnail(userId, uploadedThumbnail);
        normalizedPayload.thumbnail_url = uploadResult.url;
      } catch (error) {
        logger.error("Failed to upload diagram thumbnail:", error);
        return sendError(res, 500, "Failed to upload thumbnail");
      }
    }

    const {
      name,
      data,
      projectId,
      description,
      thumbnail_url,
      owner_name,
      owner_username,
      owner_avatar_url,
    } = createDiagramSchema.parse(normalizedPayload);

    const normalizedName =
      typeof name === "string" && name.trim().length > 0 ? name.trim() : null;

    const diagram = await createDiagram({
      userId,
      owner_email: req.user?.email ?? null,
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

    return sendSuccess(res, 201, "Diagram created successfully", { diagram });
  } catch (error) {
    logger.error("Error creating diagram:", error);
    if (error instanceof ZodError) {
      return sendError(res, 400, "Validation error", {
        details: formatZodDetails(error),
      });
    }
    return sendError(res, 500, "Failed to create diagram");
  }
};

export const updateDiagramController = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return sendError(res, 401, "Unauthorized");

    const { diagramId } = req.params;

    const diagram = await getUserDiagramById(userId, diagramId);
    if (!diagram) {
      return sendError(res, 404, "Diagram not found");
    }

    const uploadedThumbnail = getUploadedThumbnail(req);
    if (
      uploadedThumbnail &&
      !uploadedThumbnail.mimetype?.startsWith("image/")
    ) {
      return sendError(res, 400, "Thumbnail must be an image file");
    }

    const normalizedPayload = {
      name: normalizeUpdateName(req.body?.name),
      description: normalizeOptionalText(req.body?.description),
      data: req.body?.data,
      thumbnail_url: normalizeOptionalText(req.body?.thumbnail_url),
      owner_name: normalizeOptionalText(req.body?.owner_name),
      owner_username: normalizeOptionalText(req.body?.owner_username),
      owner_avatar_url: normalizeOptionalText(req.body?.owner_avatar_url),
    };

    if (uploadedThumbnail?.buffer) {
      try {
        const uploadResult = await uploadThumbnail(userId, uploadedThumbnail);
        normalizedPayload.thumbnail_url = uploadResult.url;
      } catch (error) {
        logger.error("Failed to upload diagram thumbnail bucket:", error);
        return sendError(res, 500, "Failed to upload thumbnail");
      }
    }

    const isDataUpdateRequested = normalizedPayload.data !== undefined;
    if (isDataUpdateRequested && diagram.is_active !== true) {
      return sendError(
        res,
        409,
        "Diagram is inactive. Open the canvas before saving data.",
      );
    }

    const parsed = updateDiagramSchema.parse(normalizedPayload);
    const updateData = Object.fromEntries(
      Object.entries(parsed).filter(([, value]) => value !== undefined),
    );

    const updatedDiagram = await updateDiagram(diagramId, updateData);

    if (!updatedDiagram) {
      return sendError(res, 404, "Diagram not found");
    }

    return sendSuccess(res, 200, "Diagram updated successfully", {
      diagram: updatedDiagram,
    });
  } catch (error) {
    logger.error("Error updating diagram:", error);
    if (error instanceof ZodError) {
      return sendError(res, 400, "Validation error", {
        details: formatZodDetails(error),
      });
    }
    return sendError(res, 500, "Failed to update diagram");
  }
};

/* ===================== DELETE / RESTORE ===================== */

export const softDeleteDiagramController = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return sendError(res, 401, "Unauthorized");

    const { diagramId } = req.params;

    const diagram = await getUserDiagramById(userId, diagramId);
    if (!diagram) {
      return sendError(res, 404, "Diagram not found");
    }

    const deleted = await softDeleteDiagram(userId, diagramId);
    if (!deleted) {
      return sendError(res, 404, "Diagram not found");
    }

    return sendSuccess(res, 200, "Diagram moved to trash", {
      diagramId: deleted.id,
    });
  } catch (error) {
    logger.error("Error soft deleting diagram:", error);
    return sendError(res, 500, "Failed to delete diagram");
  }
};

export const getAllSoftDeletedDiagramByUserController = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) return sendError(res, 401, "Unauthorized");

    const diagrams = await getAllSoftDeletedDiagramByUser(userId);

    return sendSuccess(res, 200, "Deleted diagrams fetched successfully", {
      diagrams,
    });
  } catch (error) {
    logger.error("Error getting deleted diagrams:", error);
    return sendError(res, 500, "Failed to fetch deleted diagrams");
  }
};

export const hardDeleteUserDiagramController = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return sendError(res, 401, "Unauthorized");

    const { diagramId } = req.params;

    const diagram = await getSoftDeletedUserDiagramById(userId, diagramId);
    if (!diagram) {
      return sendError(res, 404, "Diagram not found");
    }

    await hardDeleteUserDiagram(userId, diagramId);
    return sendSuccess(res, 200, "Diagram deleted permanently", {
      diagramId,
    });
  } catch (error) {
    logger.error("Error hard deleting diagram:", error);
    return sendError(res, 500, "Failed to delete diagram permanently");
  }
};

export const restoreDiagramController = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return sendError(res, 401, "Unauthorized");

    const { diagramId } = req.params;

    const restored = await restoreDiagram(userId, diagramId);
    if (!restored) {
      return sendError(res, 404, "Diagram not found");
    }

    return sendSuccess(res, 200, "Diagram restored successfully", {
      diagramId: restored.id,
    });
  } catch (error) {
    logger.error("Error restoring diagram:", error);
    return sendError(res, 500, "Failed to restore diagram");
  }
};

/* ===================== LIKES ===================== */

export const handleDiagramLikes = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return sendError(res, 401, "Unauthorized");

    const { diagramId } = req.params;
    const result = await toggleLikes(diagramId, userId);

    return sendSuccess(res, 200, "Diagram like status updated", {
      diagramId,
      ...result,
    });
  } catch (error) {
    logger.error("Error toggling like:", error);
    return sendError(res, 500, "Failed to update diagram like");
  }
};

export const getDiagramLikesCount = async (req, res) => {
  try {
    const { diagramId } = req.params;
    const likes = await getLikeCount(diagramId);

    return sendSuccess(res, 200, "Diagram like count fetched successfully", {
      diagramId,
      likes,
    });
  } catch (error) {
    logger.error("Error getting like count:", error);
    return sendError(res, 500, "Failed to fetch diagram like count");
  }
};

/* ===================== ACTIVE STATUS ===================== */

export const updateDiagramActiveStatusController = async (req, res) => {
  try {
    const userId = req.user?.id;
    const userEmail = req.user?.email;

    if (!userId) return sendError(res, 401, "Unauthorized");

    const { diagramId } = req.params;

    // ✅ Validate first
    const parsed = setDiagramActiveSchema.parse({
      is_active: normalizeOptionalBoolean(req.body?.is_active),
    });

    // ✅ Try direct ownership
    let diagram = await getUserDiagramById(userId, diagramId);

    // ✅ If not owner, check shared access
    if (!diagram) {
      const candidate = await getDiagramById(diagramId);
      if (!candidate) {
        return sendError(res, 404, "Diagram not found");
      }

      const hasAccess =
        candidate.project_id &&
        (await verifyProjectAccess(candidate.project_id, userId, userEmail));

      if (!hasAccess) {
        return sendError(res, 403, "Forbidden");
      }
    }

    // ✅ Update after access confirmed
    const updatedDiagram = await updateDiagram(diagramId, {
      is_active: parsed.is_active,
    });

    if (!updatedDiagram) {
      return sendError(res, 404, "Diagram not found");
    }

    return sendSuccess(res, 200, "Diagram active state updated successfully", {
      diagram: updatedDiagram,
    });
  } catch (error) {
    logger.error("Error updating diagram active state:", error);

    if (error instanceof ZodError) {
      return sendError(res, 400, "Validation error", {
        details: formatZodDetails(error),
      });
    }

    return sendError(res, 500, "Failed to update diagram active state");
  }
};

/* ===================== VISIBILITY ===================== */

export const updateDiagramVisibilityController = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return sendError(res, 401, "Unauthorized");

    const { diagramId } = req.params;
    const { isPublic } = req.body;

    if (typeof isPublic !== "boolean") {
      return sendError(res, 400, "isPublic must be boolean");
    }

    const ownedDiagram = await getUserDiagramById(userId, diagramId);
    if (!ownedDiagram) {
      return sendError(res, 403, "Forbidden");
    }

    const diagram = await setDiagramVisibility(diagramId, isPublic);
    if (!diagram) {
      return sendError(res, 404, "Diagram not found");
    }

    return sendSuccess(res, 200, "Diagram visibility updated successfully", {
      diagram,
    });
  } catch (error) {
    logger.error("Error updating diagram visibility:", error);
    return sendError(res, 500, "Failed to update diagram visibility");
  }
};
export const verifyDiagramOwnershipController = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return sendError(res, 401, "Unauthorized");

    const { diagramId } = req.params;

    const isOwner = await verifyDiagramOwnership(diagramId, userId);
    return sendSuccess(res, 200, "Diagram ownership checked successfully", {
      diagramId,
      isOwner,
    });
  } catch (error) {
    logger.error("Error getting diagram ownership:", error);
    return sendError(res, 500, "Failed to verify diagram ownership");
  }
};
