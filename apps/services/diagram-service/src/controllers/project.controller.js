import logger from "../config/logger.js";
import {
  createProjectSchema,
  updateProjectSchema,
  ZodError,
} from "../../../../../packages/zod-schemas/index.js";
import {
  getProjectsByUser,
  createProject,
  updateProjectById,
  deleteProjectById,
  verifyProjectOwnership,
  uploadThumbnail,
} from "../services/project.service.js";
import { normalizeOptionalText, normalizeUpdateName } from "../utils/helper.js";
import { getUploadedThumbnail } from "./file.controller.js";
import { formatZodDetails, sendError, sendSuccess } from "../utils/response.js";

export const getAllProjectsByUser = async (req, res) => {
  try {
    const userId = req.user?.id;
    const userEmail = req.user?.email;
    if (!userId) return sendError(res, 401, "Unauthorized");

    const rows = await getProjectsByUser(userId, userEmail);

    return sendSuccess(res, 200, "Projects fetched successfully", {
      projects: rows,
    });
  } catch (error) {
    logger.error("Error getting all projects:", error);
    return sendError(res, 500, "Failed to fetch projects");
  }
};

export const createProjectController = async (req, res) => {
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
      title:
        typeof req.body?.title === "string"
          ? req.body.title.trim()
          : req.body?.title,
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
        logger.error("Failed to upload project thumbnail:", error);
        return sendError(res, 500, "Failed to upload thumbnail");
      }
    }

    // Validate request body with Zod
    let validatedData;
    try {
      validatedData = createProjectSchema.parse(normalizedPayload);
    } catch (error) {
      if (error instanceof ZodError) {
        return sendError(res, 400, "Validation error", {
          details: formatZodDetails(error),
        });
      }
      throw error;
    }

    const {
      title,
      description,
      thumbnail_url,
      owner_name,
      owner_username,
      owner_avatar_url,
    } = validatedData;

    const newProject = await createProject({
      userId,
      title,
      description,
      thumbnail_url,
      owner_name,
      owner_username,
      owner_avatar_url,
    });
    logger.info(`Project ${newProject.title} created successfully`);

    return sendSuccess(res, 201, "Project created successfully", {
      project: newProject,
    });
  } catch (error) {
    logger.error("Error creating project:", error);
    if (error instanceof ZodError) {
      return sendError(res, 400, "Validation error", {
        details: formatZodDetails(error),
      });
    }
    return sendError(res, 500, "Failed to create project");
  }
};

export const getProjectById = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return sendError(res, 401, "Unauthorized");

    const { id } = req.params;

    // Verify project ownership
    const project = await verifyProjectOwnership(id, userId);

    if (!project) {
      return sendError(res, 404, "Project not found");
    }

    return sendSuccess(res, 200, "Project fetched successfully", { project });
  } catch (error) {
    logger.error("Error getting project by id:", error);
    return sendError(res, 500, "Failed to fetch project");
  }
};

export const updateProject = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return sendError(res, 401, "Unauthorized");

    const { id: projectId } = req.params;

    if (!projectId) return sendError(res, 400, "Project ID is required");

    // Verify project ownership
    const project = await verifyProjectOwnership(projectId, userId);

    if (!project) {
      return sendError(res, 404, "Project not found");
    }

    const uploadedThumbnail = getUploadedThumbnail(req);
    if (
      uploadedThumbnail &&
      !uploadedThumbnail.mimetype?.startsWith("image/")
    ) {
      return sendError(res, 400, "Thumbnail must be an image file");
    }

    const rawPayload = {
      title: normalizeUpdateName(req.body?.title),
      description: normalizeOptionalText(req.body?.description),
      thumbnail_url: normalizeOptionalText(req.body?.thumbnail_url),
      is_public: req.body?.is_public,
      collaborators: req.body?.collaborators,
      owner_name: normalizeOptionalText(req.body?.owner_name),
      owner_username: normalizeOptionalText(req.body?.owner_username),
      owner_avatar_url: normalizeOptionalText(req.body?.owner_avatar_url),
    };

    let validatedData;
    try {
      validatedData = updateProjectSchema.parse(rawPayload);
    } catch (error) {
      if (error instanceof ZodError) {
        return sendError(res, 400, "Validation error", {
          details: formatZodDetails(error),
        });
      }
      throw error;
    }

    const normalizedPayload = Object.fromEntries(
      Object.entries({
        title: normalizeUpdateName(validatedData?.title),
        description: normalizeOptionalText(validatedData?.description),
        thumbnail_url: normalizeOptionalText(validatedData?.thumbnail_url),
        is_public: validatedData.is_public,
        collaborators: validatedData.collaborators,
        owner_name: normalizeOptionalText(validatedData?.owner_name),
        owner_username: normalizeOptionalText(validatedData?.owner_username),
        owner_avatar_url: normalizeOptionalText(
          validatedData?.owner_avatar_url,
        ),
      }).filter(([, value]) => value !== undefined),
    );

    if (uploadedThumbnail?.buffer) {
      try {
        const uploadResult = await uploadThumbnail(userId, uploadedThumbnail);
        normalizedPayload.thumbnail_url = uploadResult.url;
      } catch (error) {
        logger.error("Failed to upload project thumbnail:", error);
        return sendError(res, 500, "Failed to upload thumbnail");
      }
    }

    const updated_project = await updateProjectById(
      userId,
      projectId,
      normalizedPayload,
    );

    if (!updated_project) return sendError(res, 404, "Project not found");

    return sendSuccess(res, 200, "Project updated successfully", {
      project: updated_project,
    });
  } catch (error) {
    logger.error("Error updating project:", error);
    if (error instanceof ZodError) {
      return sendError(res, 400, "Validation error", {
        details: formatZodDetails(error),
      });
    }
    return sendError(res, 500, "Failed to update project");
  }
};

export const deleteProject = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) return sendError(res, 401, "Unauthorized");

    const { id: projectId } = req.params;

    // Verify project ownership
    const project = await verifyProjectOwnership(projectId, userId);

    if (!project) {
      return sendError(res, 404, "Project not found");
    }

    const deleted_project = await deleteProjectById(userId, projectId);

    if (!deleted_project) return sendError(res, 404, "Project not found");

    return sendSuccess(res, 200, "Project deleted successfully", {
      projectId,
    });
  } catch (error) {
    logger.error("Error deleting project:", error);
    return sendError(res, 500, "Failed to delete project");
  }
};
