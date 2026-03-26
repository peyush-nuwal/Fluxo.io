import logger from "../config/logger.js";
import {
  addCollaboratorSchema,
  removeCollaboratorSchema,
  acceptInvitationSchema,
  ZodError,
} from "../../../../../packages/zod-schemas/index.js";
import {
  verifyProjectAccess,
  verifyProjectOwnership,
  removeCollaboratorFromProject,
  updateProjectById,
} from "../services/project.service.js";
import { sendProjectInvitation } from "../services/email.service.js";
import {
  createInvitation,
  getInvitationByToken,
  acceptInvitation as acceptInvitationService,
} from "../services/invitation.service.js";
import { formatZodDetails, sendSuccess, sendError } from "../utils/response.js";
import { redisClient } from "../services/redis.service.js";

const AUTH_SERVICE_URL =
  process.env.AUTH_SERVICE_URL || "http://localhost:4001";
const INTERNAL_SERVICE_TOKEN = process.env.INTERNAL_SERVICE_TOKEN || "";
const AUTH_USERS_TIMEOUT_MS = Number(process.env.AUTH_USERS_TIMEOUT_MS || 1500);
const USER_PROFILE_CACHE_TTL_SECONDS = Number(
  process.env.USER_PROFILE_CACHE_TTL_SECONDS || 600,
);
const USER_PROFILE_CACHE_PREFIX = "user_profile_by_email:";

const normalizeEmail = (value) =>
  typeof value === "string" ? value.trim().toLowerCase() : "";

const getProfileCacheKey = (email) => `${USER_PROFILE_CACHE_PREFIX}${email}`;

const getCachedUsersByEmails = async (emails) => {
  if (!emails.length || !redisClient?.isOpen) return [];

  const cachedUsers = [];
  try {
    const keys = emails.map((email) => getProfileCacheKey(email));
    const values = await redisClient.mGet(keys);

    values.forEach((rawValue) => {
      if (!rawValue) return;
      try {
        const parsed = JSON.parse(rawValue);
        const email = normalizeEmail(parsed?.email);
        if (!email) return;
        cachedUsers.push({
          email,
          user_name: parsed?.user_name ?? null,
          avatar_url: parsed?.avatar_url ?? null,
        });
      } catch (_error) {
        // Ignore corrupt cache entries and continue.
      }
    });
  } catch (error) {
    logger.error("Error reading user profile cache:", error);
  }

  return cachedUsers;
};

const setCachedUsers = async (users) => {
  if (!users.length || !redisClient?.isOpen) return;

  try {
    await Promise.all(
      users.map((user) =>
        redisClient.set(
          getProfileCacheKey(normalizeEmail(user.email)),
          JSON.stringify({
            email: normalizeEmail(user.email),
            user_name: user.user_name ?? null,
            avatar_url: user.avatar_url ?? null,
          }),
          { EX: USER_PROFILE_CACHE_TTL_SECONDS },
        ),
      ),
    );
  } catch (error) {
    logger.error("Error writing user profile cache:", error);
  }
};

const fetchUsersByEmailsFromAuth = async (emails, requesterUserId) => {
  if (!emails.length) return [];

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), AUTH_USERS_TIMEOUT_MS);
  try {
    const response = await fetch(
      `${AUTH_SERVICE_URL}/api/v1/auth/users/bulk-by-email`,
      {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": requesterUserId,
          "X-Internal-Service-Token": INTERNAL_SERVICE_TOKEN,
        },
        body: JSON.stringify({ emails }),
      },
    );

    if (!response.ok) {
      const text = await response.text();
      logger.error("Failed fetching users by emails from auth-service", {
        status: response.status,
        body: text,
      });
      return [];
    }

    const data = await response.json();
    const users = Array.isArray(data?.users) ? data.users : [];
    await setCachedUsers(users);
    return users;
  } catch (error) {
    logger.error("Error calling auth-service users bulk endpoint:", error);
    return [];
  } finally {
    clearTimeout(timeoutId);
  }
};

const getUsersByEmails = async (emails, requesterUserId) => {
  if (!emails.length) return [];

  const normalizedEmails = [
    ...new Set(emails.map((email) => normalizeEmail(email)).filter(Boolean)),
  ];
  const cachedUsers = await getCachedUsersByEmails(normalizedEmails);
  const cachedEmailSet = new Set(
    cachedUsers.map((user) => normalizeEmail(user.email)),
  );
  const missingEmails = normalizedEmails.filter(
    (email) => !cachedEmailSet.has(email),
  );

  if (!missingEmails.length) {
    return cachedUsers;
  }

  const fetchedUsers = await fetchUsersByEmailsFromAuth(
    missingEmails,
    requesterUserId,
  );

  return [...cachedUsers, ...fetchedUsers];
};
export const getCollaboratorsByProject = async (req, res) => {
  try {
    const userId = req.user?.id;
    const requesterEmail = req.user?.email;

    if (!userId || !requesterEmail) {
      return sendError(res, 401, "Unauthorized");
    }

    const { projectId } = req.params;
    if (!projectId) {
      return sendError(res, 400, "Project ID is required");
    }

    const project = await verifyProjectAccess(
      projectId,
      userId,
      requesterEmail,
    );

    if (!project) {
      return sendError(res, 404, "Project not found");
    }

    const ownerEmail = normalizeEmail(project.owner_email);
    const collaboratorEmails = (project.collaborators || [])
      .map(normalizeEmail)
      .filter((e) => e && e !== ownerEmail);

    const uniqueEmails = [...new Set([ownerEmail, ...collaboratorEmails])];

    const users = await getUsersByEmails(uniqueEmails, userId);

    const userMap = new Map(users.map((u) => [normalizeEmail(u.email), u]));

    const members = uniqueEmails.map((email) => {
      const user = userMap.get(email);
      return {
        email,
        user_name: user?.user_name ?? null,
        avatar_url: user?.avatar_url ?? null,
        role: email === ownerEmail ? "owner" : "collaborator",
      };
    });

    const isOwner = project.user_id === userId;

    return sendSuccess(res, 200, "Project collaborators fetched successfully", {
      members,
      viewerRole: isOwner ? "owner" : "collaborator",
    });
  } catch (error) {
    logger.error("Error getting collaborators:", error);
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
    const userId = req.user?.id;
    const userEmail = req.user?.email;
    if (!userId || !userEmail) return sendError(res, 401, "Unauthorized");

    const tokenFromBody = req.body?.token;
    const tokenFromQuery = req.query?.token;
    const token = tokenFromBody || tokenFromQuery;

    // Validate request body with Zod
    let validatedData;
    try {
      validatedData = acceptInvitationSchema.parse({ token });
    } catch (error) {
      if (error instanceof ZodError) {
        return sendError(res, 400, "Validation error", {
          details: formatZodDetails(error),
        });
      }
      throw error;
    }

    const { token: invitationToken } = validatedData;

    const invitation = await getInvitationByToken(invitationToken);
    if (!invitation) {
      return sendError(res, 404, "Invitation not found");
    }

    const normalizedInvitationEmail = normalizeEmail(invitation.email);
    const normalizedUserEmail = normalizeEmail(userEmail);

    if (normalizedInvitationEmail !== normalizedUserEmail) {
      return sendError(
        res,
        403,
        "This invitation belongs to another email account",
      );
    }

    // Accept the invitation (this will add user as collaborator if valid)
    try {
      const result = await acceptInvitationService(invitationToken);

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
      if (invitationError?.message?.includes("not found")) {
        return sendError(res, 404, "Invitation not found");
      }
      if (invitationError?.message?.includes("expired")) {
        return sendError(res, 400, "Invitation has expired");
      }
      if (invitationError?.message?.includes("already")) {
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
