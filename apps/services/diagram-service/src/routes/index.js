import { Router } from "express";
// import * as projectController from "../controllers/project.controller";
// import * as diagramController from "../controllers/diagram.controller";

const router = Router();

// // Project routes
router.get("testing", () => {
  console.log("diagram routes working");
});
// router.get("/projects", projectController.getAllProjects);
// router.post("/projects", projectController.createProject);
// router.get("/projects/:id", projectController.getProjectById);
// router.put("/projects/:id", projectController.updateProject);
// router.delete("/projects/:id", projectController.deleteProject);

// // Diagram routes
// router.get("/projects/:projectId/diagrams", diagramController.getDiagramsByProject);
// router.post("/projects/:projectId/diagrams", diagramController.createDiagram);
// router.put("/diagrams/:id", diagramController.updateDiagram);
// router.delete("/diagrams/:id", diagramController.deleteDiagram);

export default router;
