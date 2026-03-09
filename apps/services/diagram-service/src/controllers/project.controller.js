import logger from "../config/logger.js";
import {
  createProjectSchema,
  updateProjectSchema,
  ZodError,
} from "../../../../../packages/zod-schemas/index.js";
import {
  getProjectsByUser,
  createProjectRecord,
  updateProjectById,
  deleteProjectById,
  verifyProjectOwnership,
  uploadThumbnail,
} from "../services/project.service.js";

const normalizeOptionalText = (value) => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== "string") return value;

  const trimmed = value.trim();
  if (trimmed === "") return null;
  if (trimmed.toLowerCase() === "null") return null;
  return trimmed;
};

export const getUploadedThumbnail = (req) => {
  if (!req.files || typeof req.files !== "object") return null;

  const files = req.files;
  if (Array.isArray(files.thumbnail) && files.thumbnail.length > 0) {
    return files.thumbnail[0];
  }
  if (Array.isArray(files.thumbnail_url) && files.thumbnail_url.length > 0) {
    return files.thumbnail_url[0];
  }

  return null;
};

export const getAllProjects = async (req, res) => {
  try {
    const userId = req.user?.id;
    const userEmail = req.user?.email;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const rows = await getProjectsByUser(userId, userEmail);

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

    const uploadedThumbnail = getUploadedThumbnail(req);

    if (
      uploadedThumbnail &&
      !uploadedThumbnail.mimetype?.startsWith("image/")
    ) {
      return res.status(400).json({ error: "Thumbnail must be an image file" });
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
        return res.status(500).json({ error: "Failed to upload thumbnail" });
      }
    }

    // Validate request body with Zod
    let validatedData;
    try {
      validatedData = createProjectSchema.parse(normalizedPayload);
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

    const {
      title,
      description,
      thumbnail_url,
      owner_name,
      owner_username,
      owner_avatar_url,
    } = validatedData;

    const newProject = await createProjectRecord({
      userId,
      title,
      description,
      thumbnail_url,
      owner_name,
      owner_username,
      owner_avatar_url,
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

    const {
      title,
      description,
      thumbnail_url,
      is_public,
      collaborators,
      owner_name,
      owner_username,
      owner_avatar_url,
    } = validatedData;

    // Verify project ownership
    const project = await verifyProjectOwnership(projectId, userId);

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Build update object with only provided fields
    const updateFields = {};
    if (title !== undefined) updateFields.title = title;
    if (description !== undefined) updateFields.description = description;
    if (thumbnail_url !== undefined) updateFields.thumbnail_url = thumbnail_url;
    if (is_public !== undefined) updateFields.is_public = is_public;
    if (collaborators !== undefined) updateFields.collaborators = collaborators;
    if (owner_name !== undefined) updateFields.owner_name = owner_name;
    if (owner_username !== undefined)
      updateFields.owner_username = owner_username;
    if (owner_avatar_url !== undefined)
      updateFields.owner_avatar_url = owner_avatar_url;

    const updated_project = await updateProjectById(
      userId,
      projectId,
      updateFields,
    );

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

    const deleted_project = await deleteProjectById(userId, projectId);

    if (!deleted_project)
      return res.status(404).json({ error: "Project not found" });

    return res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    logger.error("Error deleting project:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
