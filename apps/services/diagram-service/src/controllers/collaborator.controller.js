import logger from "../config/logger.js";
import {
  addCollaboratorSchema,
  removeCollaboratorSchema,
  acceptInvitationSchema,
  ZodError,
} from "../../../../../packages/zod-schemas/index.js";
import {
  verifyProjectOwnership,
  removeCollaboratorFromProject,
} from "../services/project.service.js";
import { sendProjectInvitation } from "../services/email.service.js";
import {
  createInvitation,
  acceptInvitation as acceptInvitationService,
} from "../services/invitation.service.js";

export const getCollaboratorsByProject = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { projectId } = req.params;
    if (!projectId)
      return res.status(400).json({ error: "Project ID is required" });

    // Verify project ownership (only owner can view collaborators)
    const project = await verifyProjectOwnership(projectId, userId);

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Get collaborators directly from project (returns emails array)
    const collaborators = project.collaborators || [];

    return res.status(200).json({ collaborators });
  } catch (error) {
    logger.error("Error getting collaborators by project:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const addCollaborator = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { projectId } = req.params;
    if (!projectId)
      return res.status(400).json({ error: "Project ID is required" });

    // Verify project ownership
    const project = await verifyProjectOwnership(projectId, userId);

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Validate request body with Zod
    let validatedData;
    try {
      validatedData = addCollaboratorSchema.parse(req.body);
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

    const { email: collaboratorEmail } = validatedData;

    // Normalize email
    const normalizedEmail = collaboratorEmail.trim().toLowerCase();

    // Get current user email to prevent adding owner
    const currentUser = req.user;
    if (
      currentUser?.email &&
      currentUser.email.toLowerCase() === normalizedEmail
    ) {
      return res
        .status(400)
        .json({ error: "Cannot add project owner as collaborator" });
    }

    // Check if user is already a collaborator
    const collaborators = project.collaborators || [];
    const normalizedCollaborators = collaborators.map((email) =>
      email.toLowerCase(),
    );
    if (normalizedCollaborators.includes(normalizedEmail)) {
      return res
        .status(400)
        .json({ error: "This user is already a collaborator" });
    }

    // Create invitation instead of directly adding collaborator
    const invitation = await createInvitation(projectId, normalizedEmail);

    if (!invitation) {
      return res.status(500).json({ error: "Failed to create invitation" });
    }

    // Send invitation email to the collaborator
    try {
      const ownerName = req.user?.name || req.user?.email || "A user";
      await sendProjectInvitation(
        normalizedEmail,
        project.title,
        ownerName,
        invitation.token,
      );
      logger.info(
        `Invitation email sent to ${collaboratorEmail} for project ${project.title}`,
      );
    } catch (emailError) {
      // Log email error but don't fail the request since invitation was created
      logger.error(
        `Failed to send invitation email to ${collaboratorEmail}:`,
        emailError,
      );
      // Continue - invitation was created successfully even if email fails
    }

    logger.info(
      `Invitation created for ${collaboratorEmail} to project ${projectId}`,
    );

    return res.status(200).json({
      message: "Invitation sent successfully",
      email: normalizedEmail,
    });
  } catch (error) {
    logger.error("Error adding collaborator:", error);
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

export const removeCollaborator = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { projectId } = req.params;
    if (!projectId)
      return res.status(400).json({ error: "Project ID is required" });

    // Validate request body with Zod (email)
    let validatedData;
    try {
      validatedData = removeCollaboratorSchema.parse(req.body);
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

    const { email: collaboratorEmail } = validatedData;

    // Normalize email
    const normalizedEmail = collaboratorEmail.trim().toLowerCase();

    // Verify project ownership
    const project = await verifyProjectOwnership(projectId, userId);

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Remove collaborator (removes email directly, no DB lookup)
    const updatedProject = await removeCollaboratorFromProject(
      projectId,
      normalizedEmail,
    );

    if (!updatedProject) {
      return res.status(404).json({ error: "Project not found" });
    }

    logger.info(
      `Collaborator ${collaboratorEmail} removed from project ${projectId}`,
    );

    // Return all collaborators from updated project
    const collaborators = updatedProject.collaborators || [];

    return res.status(200).json({
      message: "Collaborator removed successfully",
      collaborators,
    });
  } catch (error) {
    logger.error("Error removing collaborator:", error);
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

export const acceptInvitation = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    // Validate request body with Zod
    let validatedData;
    try {
      validatedData = acceptInvitationSchema.parse(req.body);
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

    const { token } = validatedData;
    const userEmail = req.user?.email;

    if (!userEmail) {
      return res.status(400).json({ error: "User email is required" });
    }

    // Accept the invitation (this will add user as collaborator if valid)
    try {
      const result = await acceptInvitationService(token, userEmail);

      return res.status(200).json({
        message: "Invitation accepted successfully",
        project: {
          id: result.project.id,
          title: result.project.title,
          description: result.project.description,
        },
      });
    } catch (invitationError) {
      logger.error("Error accepting invitation:", invitationError);

      // Handle specific invitation errors
      if (invitationError.message.includes("not found")) {
        return res.status(404).json({ error: "Invitation not found" });
      }
      if (invitationError.message.includes("expired")) {
        return res.status(400).json({ error: "Invitation has expired" });
      }
      if (invitationError.message.includes("not sent to your email")) {
        return res.status(403).json({ error: invitationError.message });
      }
      if (invitationError.message.includes("already")) {
        return res.status(400).json({ error: invitationError.message });
      }

      return res.status(500).json({ error: "Failed to accept invitation" });
    }
  } catch (error) {
    logger.error("Error in accept invitation handler:", error);
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
