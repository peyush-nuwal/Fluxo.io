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
  handleDiagramLikes,
} from "../controllers/diagram.controller.js";
import {
  getCollaboratorsByProject,
  addCollaborator,
  removeCollaborator,
  acceptInvitation,
} from "../controllers/collaborator.controller.js";

const router = Router();

// Project routes
router.get("/projects", getAllProjects);
router.post("/projects", createProject);
router.get("/projects/:id", getProjectById);
router.put("/projects/:id", updateProject);
router.delete("/projects/:id", deleteProject);

// Diagram routes

// get all diagrams in project
router.get("/projects/:projectId/diagrams", getDiagramsByProject);

// get all user diagrams
router.get("/diagrams", createDiagram);

//create diagram
router.post("/diagrams", createDiagram);

// Get diagram by id
router.put("/diagrams/:id", updateDiagram);

// update and delete diagram
router.put("/diagrams/:id", updateDiagram);
router.delete("/diagrams/:id", deleteDiagram);

// diagram likes
router.post("/diagrams/:diagramId/like", handleDiagramLikes);

// collaborators routes
router.get("/projects/:projectId/collaborators", getCollaboratorsByProject);
router.post("/projects/:projectId/collaborators", addCollaborator);

router.delete("/projects/:projectId/collaborators", removeCollaborator);

// Invitation route
router.post("/invitations/accept", acceptInvitation);

export default router;
