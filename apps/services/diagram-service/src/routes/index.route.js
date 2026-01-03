import { Router } from "express";
import {
  getAllProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
} from "../controllers/project.controller.js";

import {
  getDiagramsByProjectController,
  getAllDiagramsByUserController,
  getDiagramByIdController,
  createDiagramController,
  updateDiagramController,
  handleDiagramLikes,
  getDiagramLikesCount,
  restoreDiagramController,
  softDeleteDiagramController,
  hardDeleteUserDiagramController,
  getPublicDiagramController,
  updateDiagramVisibilityController,
} from "../controllers/diagram.controller.js";

import {
  getCollaboratorsByProject,
  addCollaborator,
  removeCollaborator,
  acceptInvitation,
} from "../controllers/collaborator.controller.js";

const router = Router();

/* ===================== PROJECTS ===================== */

router.get("/projects", getAllProjects);
router.post("/projects", createProject);
router.get("/projects/:id", getProjectById);
router.put("/projects/:id", updateProject);
router.delete("/projects/:id", deleteProject);

/* ===================== DIAGRAMS ===================== */

// all diagrams inside a project
router.get("/projects/:projectId/diagrams", getDiagramsByProjectController);

// all diagrams of logged-in user
router.get("/diagrams", getAllDiagramsByUserController);

// get single diagram
router.get("/diagrams/:diagramId", getDiagramByIdController);
// incrementDiagramViews
router.get("/diagrams/:diagramId/public", getPublicDiagramController);

// create diagram
router.post("/diagrams", createDiagramController);
// update
router.put("/diagrams/:diagramId", updateDiagramController);

// soft delete diagram
router.delete("/diagrams/:diagramId", softDeleteDiagramController);
//restore deleted diagram
router.delete("/diagrams/:diagramId/restore", restoreDiagramController);
// hard delete diagram
router.delete("/admin/diagrams/:diagramId", hardDeleteUserDiagramController);

// diagram likes
router.post("/diagrams/:diagramId/like", handleDiagramLikes);
router.get("/diagrams/:diagramId/like", getDiagramLikesCount);

// set diagram visibility (public/private)
router.patch(
  "/diagrams/:diagramId/visibility",
  updateDiagramVisibilityController,
);

/* ===================== COLLABORATORS ===================== */

router.get("/projects/:projectId/collaborators", getCollaboratorsByProject);

router.post("/projects/:projectId/collaborators", addCollaborator);

router.delete("/projects/:projectId/collaborators", removeCollaborator);

/* ===================== INVITATIONS ===================== */

router.post("/invitations/accept", acceptInvitation);

export default router;
