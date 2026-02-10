import { db } from "../config/database.js";
import { and, count, eq, isNull, not, sql } from "drizzle-orm";
import logger from "../config/logger.js";
import { verifyProjectOwnership } from "./project.service.js";
import { diagrams, diagram_likes } from "../models/index.model.js";

export { verifyProjectOwnership } from "./project.service.js";

export const verifyDiagramOwnership = async (diagramId, projectId, userId) => {
  try {
    // First verify the project belongs to the user
    const project = await verifyProjectOwnership(projectId, userId);
    if (!project) {
      return null;
    }

    // Then verify the diagram exists and belongs to the project
    const [diagram] = await db
      .select()
      .from(diagrams)
      .where(
        and(
          eq(diagrams.id, diagramId),
          eq(diagrams.project_id, projectId),
          isNull(diagrams.deleted_at),
        ),
      );

    if (!diagram) {
      throw new Error("Diagram not found");
    }

    return diagram;
  } catch (error) {
    logger.error("Error verifying diagram ownership:", error);
    return null;
  }
};

export const getDiagramByProject = async (userId, projectId) => {
  const diagramList = await db
    .select()
    .from(diagrams)
    .where(
      and(
        eq(diagrams.project_id, projectId),
        eq(diagrams.user_id, userId),
        isNull(diagrams.deleted_at),
      ),
    );

  return diagramList;
};

export const getDiagramsByUser = async (userId) => {
  const diagramList = await db
    .select()
    .from(diagrams)
    .where(and(eq(diagrams.user_id, userId), isNull(diagrams.deleted_at)));

  return diagramList;
};

export const getUserDiagramById = async (userId, diagramId) => {
  return db
    .findFirst()
    .from(diagrams)
    .where(
      and(
        eq(diagrams.id, diagramId),
        eq(diagrams.user_id, userId),
        isNull(diagrams.deleted_at),
      ),
    );
};

export const getPublicDiagramById = async (diagramId) => {
  return db
    .findFirst()
    .from(diagrams)
    .where(
      and(
        eq(diagrams.id, diagramId),
        eq(diagrams.is_public, true),
        isNull(diagrams.deleted_at),
      ),
    );
};

export const createDiagram = async ({
  userId,
  projectId,
  name,
  data,
  description,
  thumbnail_url,
  owner_name,
  owner_username,
  owner_avatar_url,
}) => {
  const [diagram] = await db
    .insert(diagrams)
    .values({
      user_id: userId,
      project_id: projectId,
      name,
      data,
      description,
      thumbnail_url,
      owner_name,
      owner_username,
      owner_avatar_url,
    })
    .returning({
      id: diagrams.id,
      name: diagrams.name,
      data: diagrams.data,
      description: diagrams.description,
      thumbnail_url: diagrams.thumbnail_url,
      owner_name: diagrams.owner_name,
      owner_username: diagrams.owner_username,
      owner_avatar_url: diagrams.owner_avatar_url,
    });

  return diagram;
};

export const updateDiagram = async (diagramId, updateFields) => {
  const [diagram] = await db
    .update(diagrams)
    .set({
      ...updateFields,
      updated_at: new Date(),
    })
    .where(eq(diagrams.id, diagramId))
    .returning();

  return diagram;
};

export const softDeleteDiagram = async (userId, diagramId) => {
  const [diagram] = await db
    .update(diagrams)
    .set({
      deleted_at: new Date(),
      updated_at: new Date(),
    })
    .where(
      and(
        eq(diagrams.id, diagramId),
        eq(diagrams.user_id, userId),
        isNull(diagrams.deleted_at),
      ),
    )
    .returning({ id: diagrams.id });

  return diagram;
};

export const restoreDiagram = async (userId, diagramId) => {
  const [diagram] = await db
    .update(diagrams)
    .set({
      deleted_at: null,
      updated_at: new Date(),
    })
    .where(
      and(
        eq(diagrams.id, diagramId),
        eq(diagrams.user_id, userId),
        not(isNull(diagrams.deleted_at)),
      ),
    )
    .returning({ id: diagrams.id });

  return diagram;
};

export const hardDeleteUserDiagram = async (userId, diagramId) => {
  await db
    .delete(diagrams)
    .where(and(eq(diagrams.id, diagramId), eq(diagrams.user_id, userId)));
};

export const incrementDiagramViews = async (diagramId) => {
  await db
    .update(diagrams)
    .set({
      views: sql`${diagrams.views} + 1`,
    })
    .where(and(eq(diagrams.id, diagramId), isNull(diagrams.deleted_at)));
};

export const hasUserLiked = async (diagramId, userId) => {
  const res = await db.query.diagram_likes.findFirst({
    where: and(
      eq(diagram_likes.diagram_id, diagramId),
      eq(diagram_likes.user_id, userId),
    ),
  });

  return !!res;
};

export const toggleLikes = async (diagramId, userId) => {
  const alreadyLiked = await hasUserLiked(diagramId, userId);

  if (alreadyLiked) {
    await db
      .delete(diagram_likes)
      .where(
        and(
          eq(diagram_likes.diagram_id, diagramId),
          eq(diagram_likes.user_id, userId),
        ),
      );

    return { liked: false };
  }

  await db.insert(diagram_likes).values({
    diagram_id: diagramId,
    user_id: userId,
  });

  return { liked: true };
};

export const getLikeCount = async (diagramId) => {
  const res = await db
    .select({ count: count() })
    .from(diagram_likes)
    .where(eq(diagram_likes.diagram_id, diagramId));

  return Number(res[0].count);
};

export const setDiagramVisibility = async (diagramId, isPublic) => {
  const result = await db
    .update(diagrams)
    .set({
      is_public: isPublic,
      updated_at: new Date(),
    })
    .where(and(eq(diagrams.id, diagramId), isNull(diagrams.deleted_at)))
    .returning({
      id: diagrams.id,
      is_public: diagrams.is_public,
    });

  return result[0] ?? null;
};

export const updateDiagramLastOpened = async (diagramId) => {
  await db
    .update(diagrams)
    .set({ last_opened_at: new Date() })
    .where(eq(diagrams.id, diagramId));
};
