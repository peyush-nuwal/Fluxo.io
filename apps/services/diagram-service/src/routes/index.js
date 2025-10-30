import { Router } from "express";
import {
  getAllProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
} from "../controllers/project.controller.js";
// import * as diagramController from "../controllers/diagram.controller";

const router = Router();

// Project routes
router.get("/api/v1/projects", getAllProjects);
router.post("/api/v1/projects", createProject);
router.get("/api/v1/projects/:id", getProjectById);
router.put("/api/v1/projects/:id", updateProject);
router.delete("/api/v1/projects/:id", deleteProject);

// // Diagram routes
// router.get("/projects/:projectId/diagrams", diagramController.getDiagramsByProject);
// router.post("/projects/:projectId/diagrams", diagramController.createDiagram);
// router.put("/diagrams/:id", diagramController.updateDiagram);
// router.delete("/diagrams/:id", diagramController.deleteDiagram);

export default router;
