import { db } from "../config/database.js";
import {
  and,
  count,
  desc,
  eq,
  inArray,
  isNotNull,
  isNull,
  not,
  sql,
} from "drizzle-orm";
import logger from "../config/logger.js";
import { diagrams, diagram_likes, projects } from "../models/index.model.js";
import { createDefaultProject } from "./project.service.js";

export {
  verifyProjectOwnership,
  verifyProjectAccess,
} from "./project.service.js";

export const verifyDiagramOwnership = async (diagramId, userId) => {
  try {
    const [diagram] = await db
      .select({ id: diagrams.id })
      .from(diagrams)
      .where(
        and(
          eq(diagrams.id, diagramId),
          eq(diagrams.user_id, userId),
          isNull(diagrams.deleted_at),
        ),
      );

    return !!diagram;
  } catch (error) {
    logger.error("Error verifying diagram ownership:", error);
    return false;
  }
};

export const getDiagramByProject = async (projectId) => {
  const diagramList = await db
    .select()
    .from(diagrams)
    .where(
      and(eq(diagrams.project_id, projectId), isNull(diagrams.deleted_at)),
    );

  return diagramList;
};

export const getDiagramsByUser = async (
  userId,
  userEmail,
  defaultOwner = {},
) => {
  let ownerDiagrams = await db
    .select()
    .from(diagrams)
    .where(and(eq(diagrams.user_id, userId), isNull(diagrams.deleted_at)));

  if (ownerDiagrams.length === 0) {
    await createDefaultDiagramForUser(userId, null, defaultOwner);
    ownerDiagrams = await db
      .select()
      .from(diagrams)
      .where(and(eq(diagrams.user_id, userId), isNull(diagrams.deleted_at)));
  }

  const ownerWithAccess = ownerDiagrams.map((diagram) => ({
    ...diagram,
    access_type: "owner",
  }));

  const normalizedUserEmail = userEmail?.trim().toLowerCase();
  if (!normalizedUserEmail) {
    return ownerWithAccess;
  }

  const sharedProjects = await db
    .select({ id: projects.id })
    .from(projects)
    .where(
      and(
        isNull(projects.deleted_at),
        sql`${projects.collaborators}::jsonb @> ${JSON.stringify([normalizedUserEmail])}::jsonb`,
      ),
    );

  const sharedProjectIds = sharedProjects.map((project) => project.id);
  if (sharedProjectIds.length === 0) {
    return ownerWithAccess;
  }

  const sharedDiagrams = await db
    .select()
    .from(diagrams)
    .where(
      and(
        inArray(diagrams.project_id, sharedProjectIds),
        isNull(diagrams.deleted_at),
        not(eq(diagrams.user_id, userId)),
      ),
    );

  const sharedWithAccess = sharedDiagrams.map((diagram) => ({
    ...diagram,
    access_type: "shared",
  }));

  return [...ownerWithAccess, ...sharedWithAccess];
};

export const getUserDiagramById = async (userId, diagramId) => {
  return db.query.diagrams.findFirst({
    where: and(
      eq(diagrams.id, diagramId),
      eq(diagrams.user_id, userId),
      isNull(diagrams.deleted_at),
    ),
  });
};

export const getDiagramById = async (diagramId) => {
  return db.query.diagrams.findFirst({
    where: and(eq(diagrams.id, diagramId), isNull(diagrams.deleted_at)),
  });
};

export const getSoftDeletedUserDiagramById = async (userId, diagramId) => {
  return db.query.diagrams.findFirst({
    where: and(
      eq(diagrams.id, diagramId),
      eq(diagrams.user_id, userId),
      isNotNull(diagrams.deleted_at),
    ),
  });
};

export const getPublicDiagramById = async (diagramId) => {
  return db.query.diagrams.findFirst({
    where: and(
      eq(diagrams.id, diagramId),
      eq(diagrams.is_public, true),
      isNull(diagrams.deleted_at),
    ),
  });
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
  const resolvedName = name ?? (await getNextUntitledName(userId));
  const resolvedData = data ?? {
    nodes: [],
    edges: [],
    viewport: { x: 0, y: 0, zoom: 1 },
  };

  let defaultProjectId = null;
  if (!projectId) {
    const defaultProject = await createDefaultProject({
      userId,
      owner_name: owner_name,
      owner_username: owner_username,
      owner_avatar_url: owner_avatar_url,
    });
    defaultProjectId = defaultProject.id;
  }

  const [diagram] = await db
    .insert(diagrams)
    .values({
      user_id: userId,
      project_id: projectId ?? defaultProjectId,
      name: resolvedName,
      data: resolvedData,
      description: description ?? null,
      thumbnail_url: thumbnail_url ?? null,
      owner_name: owner_name ?? null,
      owner_username: owner_username ?? null,
      owner_avatar_url: owner_avatar_url ?? null,
    })
    .returning({
      id: diagrams.id,
      name: diagrams.name,
      projectId: diagrams.project_id,
      data: diagrams.data,
      description: diagrams.description,
      thumbnail_url: diagrams.thumbnail_url,
      owner_name: diagrams.owner_name,
      owner_username: diagrams.owner_username,
      owner_avatar_url: diagrams.owner_avatar_url,
    });

  return diagram;
};

const UNTITLED_PREFIX = "Untitled-";

const getNextUntitledName = async (userId) => {
  const existing = await db
    .select({ name: diagrams.name })
    .from(diagrams)
    .where(eq(diagrams.user_id, userId));

  let maxNumber = 0;
  for (const row of existing) {
    const match = row.name?.match(/^Untitled-(\d+)$/i);
    if (!match) continue;
    const n = Number.parseInt(match[1], 10);
    if (Number.isFinite(n) && n > maxNumber) maxNumber = n;
  }

  return `${UNTITLED_PREFIX}${maxNumber + 1}`;
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

  return diagram ?? null;
};

export const getAllSoftDeletedDiagramByUser = async (userId) => {
  return db
    .select()
    .from(diagrams)
    .where(and(eq(diagrams.user_id, userId), isNotNull(diagrams.deleted_at)))
    .orderBy(desc(diagrams.deleted_at));
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

export const createDefaultDiagramForUser = async (
  userId,
  projectId = null,
  defaults = {},
) => {
  return createDiagram({
    userId,
    projectId,
    name: null,
    data: null,
    description: null,
    thumbnail_url: null,
    owner_name: defaults.owner_name ?? null,
    owner_username: defaults.owner_username ?? null,
    owner_avatar_url: defaults.owner_avatar_url ?? null,
  });
};
