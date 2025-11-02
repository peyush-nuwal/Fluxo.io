import { Router } from "express";
import {
  getAllProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
} from "../controllers/project.controller.js";
import {
  getDiagramsByProject,
  createDiagram,
  updateDiagram,
  deleteDiagram,
} from "../controllers/diagram.controller.js";
import {
  getCollaboratorsByProject,
  addCollaborator,
  removeCollaborator,
  acceptInvitation,
} from "../controllers/collaborator.controller.js";

const router = Router();

// Project routes
router.get("/api/v1/projects", getAllProjects);
router.post("/api/v1/projects", createProject);
router.get("/api/v1/projects/:id", getProjectById);
router.put("/api/v1/projects/:id", updateProject);
router.delete("/api/v1/projects/:id", deleteProject);

// Diagram routes
router.get("/api/v1/projects/:projectId/diagrams", getDiagramsByProject);
router.post("/api/v1/projects/:projectId/diagrams", createDiagram);
router.put("/api/v1/projects/:projectId/diagrams/:id", updateDiagram);
router.delete("/api/v1/projects/:projectId/diagrams/:id", deleteDiagram);

// collaborators routes
router.get(
  "/api/v1/projects/:projectId/collaborators",
  getCollaboratorsByProject,
);
router.post("/api/v1/projects/:projectId/collaborators", addCollaborator);

router.delete("/api/v1/projects/:projectId/collaborators", removeCollaborator);

// Invitation route
router.post("/api/v1/invitations/accept", acceptInvitation);

export default router;
