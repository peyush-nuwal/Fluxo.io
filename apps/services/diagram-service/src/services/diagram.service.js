import { db } from "../config/database.js";
import diagramsTable from "../models/diagram.model.js";
import { and, eq, isNull } from "drizzle-orm";
import logger from "../config/logger.js";
import { verifyProjectOwnership } from "./project.service.js";

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
      .from(diagramsTable)
      .where(
        and(
          eq(diagramsTable.id, diagramId),
          eq(diagramsTable.project_id, projectId),
          isNull(diagramsTable.deleted_at),
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
