import { db } from "../config/database.js";
import { and, count, eq, isNull } from "drizzle-orm";
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
