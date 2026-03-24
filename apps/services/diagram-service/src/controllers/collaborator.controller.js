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
import { formatZodDetails, sendSuccess, sendError } from "../utils/response.js";
export const getCollaboratorsByProject = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return sendError(res, 401, "Unauthorized");

    const { projectId } = req.params;
    if (!projectId) return sendError(res, 400, "Project ID is required");

    // Verify project ownership (only owner can view collaborators)
    const project = await verifyProjectOwnership(projectId, userId);

    if (!project) {
      return sendError(res, 404, "Project not found");
    }

    // Get collaborators directly from project (returns emails array)
    const collaborators = project.collaborators || [];

    return sendSuccess(res, 200, "Project collaborators fetched successfully", {
      collaborators,
    });
  } catch (error) {
    logger.error("Error getting collaborators by project:", error);
    return sendError(res, 500, "Failed to fetch project collaborators");
  }
};

export const addCollaborator = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return sendError(res, 401, "Unauthorized");

    const { projectId } = req.params;
    if (!projectId) return sendError(res, 400, "Project ID is required");

    // Verify project ownership
    const project = await verifyProjectOwnership(projectId, userId);

    if (!project) {
      return sendError(res, 404, "Project not found");
    }

    // Validate request body with Zod
    let validatedData;
    try {
      validatedData = addCollaboratorSchema.parse(req.body);
    } catch (error) {
      if (error instanceof ZodError) {
        return sendError(res, 400, "Validation error", {
          details: formatZodDetails(error),
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
      return sendError(res, 400, "Cannot add project owner as collaborator");
    }

    // Check if user is already a collaborator
    const collaborators = project.collaborators || [];
    const normalizedCollaborators = collaborators.map((email) =>
      email.toLowerCase(),
    );
    if (normalizedCollaborators.includes(normalizedEmail)) {
      return sendError(res, 400, "This user is already a collaborator");
    }

    // Create invitation instead of directly adding collaborator
    const invitation = await createInvitation(projectId, normalizedEmail);

    if (!invitation) {
      return sendError(res, 500, "Failed to create invitation");
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

    return sendSuccess(res, 200, "Invitation sent successfully", {
      email: normalizedEmail,
    });
  } catch (error) {
    logger.error("Error adding collaborator:", error);
    if (error instanceof ZodError) {
      return sendError(res, 400, "Validation error", {
        details: formatZodDetails(error),
      });
    }
    return sendError(res, 500, "Internal server error");
  }
};

export const removeCollaborator = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return sendError(res, 401, "Unauthorized");

    const { projectId } = req.params;
    if (!projectId) return sendError(res, 400, "Project ID is required");

    // Validate request body with Zod (email)
    let validatedData;
    try {
      validatedData = removeCollaboratorSchema.parse(req.body);
    } catch (error) {
      if (error instanceof ZodError) {
        return sendError(res, 400, "Validation error", {
          details: formatZodDetails(error),
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
      return sendError(res, 404, "Project not found");
    }

    // Remove collaborator (removes email directly, no DB lookup)
    const updatedProject = await removeCollaboratorFromProject(
      projectId,
      normalizedEmail,
    );

    if (!updatedProject) {
      return sendError(res, 404, "Project not found");
    }

    logger.info(
      `Collaborator ${collaboratorEmail} removed from project ${projectId}`,
    );

    // Return all collaborators from updated project
    const collaborators = updatedProject.collaborators || [];

    return sendSuccess(res, 200, "Collaborator removed successfully", {
      collaborators,
    });
  } catch (error) {
    logger.error("Error removing collaborator:", error);
    if (error instanceof ZodError) {
      return sendError(res, 400, "Validation error", {
        details: formatZodDetails(error),
      });
    }
    return sendError(res, 500, "Internal server error");
  }
};

export const acceptInvitation = async (req, res) => {
  try {
    // Validate request body with Zod
    let validatedData;
    try {
      validatedData = acceptInvitationSchema.parse(req.body);
    } catch (error) {
      if (error instanceof ZodError) {
        return sendError(res, 400, "Validation error", {
          details: formatZodDetails(error),
        });
      }
      throw error;
    }

    const { token } = validatedData;

    // Accept the invitation (this will add user as collaborator if valid)
    try {
      const result = await acceptInvitationService(token);

      return sendSuccess(res, 200, "Invitation accepted successfully", {
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
        return sendError(res, 404, "Invitation not found");
      }
      if (invitationError.message.includes("expired")) {
        return sendError(res, 400, "Invitation has expired");
      }
      if (invitationError.message.includes("already")) {
        return sendError(res, 400, invitationError.message);
      }

      return sendError(res, 500, "Failed to accept invitation");
    }
  } catch (error) {
    logger.error("Error in accept invitation handler:", error);
    if (error instanceof ZodError) {
      return sendError(res, 400, "Validation error", {
        details: formatZodDetails(error),
      });
    }
    return sendError(res, 500, "Internal server error");
  }
};
