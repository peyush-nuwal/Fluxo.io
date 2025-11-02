import { db } from "../config/database.js";
import projectInvitationsTable from "../models/project_invitation.model.js";
import projectsTable from "../models/project.model.js";
import { and, eq } from "drizzle-orm";
import logger from "../config/logger.js";
import { randomBytes } from "crypto";
import { addCollaboratorToProject } from "./project.service.js";

/**
 * Generate a secure random token for invitation
 */
export const generateInvitationToken = () => {
  return randomBytes(32).toString("hex");
};

/**
 * Create a project invitation
 */
export const createInvitation = async (projectId, email) => {
  try {
    // Generate unique token and set expiration (7 days from now)
    const token = generateInvitationToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Check if there's already a pending invitation for this email/project
    const existingInvitation = await db
      .select()
      .from(projectInvitationsTable)
      .where(
        and(
          eq(projectInvitationsTable.project_id, projectId),
          eq(projectInvitationsTable.email, normalizedEmail),
          eq(projectInvitationsTable.status, "pending"),
        ),
      )
      .limit(1);

    if (existingInvitation.length > 0) {
      // Return existing invitation
      return existingInvitation[0];
    }

    // Create new invitation
    const [invitation] = await db
      .insert(projectInvitationsTable)
      .values({
        project_id: projectId,
        email: normalizedEmail,
        token,
        status: "pending",
        expires_at: expiresAt,
      })
      .returning();

    logger.info(
      `Invitation created for ${normalizedEmail} to project ${projectId}`,
    );

    return invitation;
  } catch (error) {
    logger.error("Error creating invitation:", error);
    return null;
  }
};

/**
 * Get invitation by token
 */
export const getInvitationByToken = async (token) => {
  try {
    const [invitation] = await db
      .select()
      .from(projectInvitationsTable)
      .where(eq(projectInvitationsTable.token, token))
      .limit(1);

    if (!invitation) {
      return null;
    }

    // Check if invitation has expired
    if (new Date() > new Date(invitation.expires_at)) {
      // Update status to expired
      await db
        .update(projectInvitationsTable)
        .set({ status: "expired" })
        .where(eq(projectInvitationsTable.id, invitation.id));
      return { ...invitation, status: "expired" };
    }

    return invitation;
  } catch (error) {
    logger.error("Error getting invitation by token:", error);
    return null;
  }
};

/**
 * Accept an invitation
 */
export const acceptInvitation = async (token, userEmail) => {
  try {
    // Get invitation
    const invitation = await getInvitationByToken(token);

    if (!invitation) {
      throw new Error("Invitation not found");
    }

    // Check if already accepted or expired
    if (invitation.status !== "pending") {
      throw new Error(`Invitation is ${invitation.status}`);
    }

    // Check if invitation has expired
    if (new Date() > new Date(invitation.expires_at)) {
      await db
        .update(projectInvitationsTable)
        .set({ status: "expired" })
        .where(eq(projectInvitationsTable.id, invitation.id));
      throw new Error("Invitation has expired");
    }

    // Verify that the accepting user's email matches the invitation email
    const normalizedUserEmail = userEmail.trim().toLowerCase();
    const normalizedInvitationEmail = invitation.email.trim().toLowerCase();

    if (normalizedUserEmail !== normalizedInvitationEmail) {
      throw new Error("This invitation was not sent to your email address");
    }

    // Add user as collaborator to the project
    const updatedProject = await addCollaboratorToProject(
      invitation.project_id,
      invitation.email,
    );

    if (!updatedProject) {
      throw new Error("Failed to add collaborator to project");
    }

    // Update invitation status to accepted
    await db
      .update(projectInvitationsTable)
      .set({
        status: "accepted",
        updated_at: new Date(),
      })
      .where(eq(projectInvitationsTable.id, invitation.id));

    // Get project details for return
    const [project] = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.id, invitation.project_id));

    logger.info(
      `Invitation accepted: ${invitation.email} added to project ${invitation.project_id}`,
    );

    return { invitation, project };
  } catch (error) {
    logger.error("Error accepting invitation:", error);
    throw error;
  }
};

/**
 * Cancel/reject an invitation
 */
export const cancelInvitation = async (invitationId) => {
  try {
    const [updatedInvitation] = await db
      .update(projectInvitationsTable)
      .set({
        status: "rejected",
        updated_at: new Date(),
      })
      .where(eq(projectInvitationsTable.id, invitationId))
      .returning();

    logger.info(`Invitation ${invitationId} cancelled`);
    return updatedInvitation;
  } catch (error) {
    logger.error("Error cancelling invitation:", error);
    return null;
  }
};
