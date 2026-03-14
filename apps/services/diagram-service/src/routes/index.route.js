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
  updateDiagramActiveStatusController,
  updateDiagramVisibilityController,
  getAllSoftDeletedDiagramByUserController,
} from "../controllers/diagram.controller.js";

import {
  getCollaboratorsByProject,
  addCollaborator,
  removeCollaborator,
  acceptInvitation,
} from "../controllers/collaborator.controller.js";
import multer from "multer";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024, files: 1 },
});
const ThumbnailUpload = (req, res, next) => {
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "thumbnail_url", maxCount: 1 },
  ])(req, res, (error) => {
    if (!error) return next();

    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return res
          .status(400)
          .json({ error: "Thumbnail file must be 2MB or smaller" });
      }
      return res.status(400).json({ error: error.message });
    }

    return res.status(400).json({
      error: error.message || "Invalid multipart/form-data payload",
    });
  });
};

/* ===================== PROJECTS ===================== */

router.get("/projects", getAllProjects);
router.post("/projects", ThumbnailUpload, createProject);
router.get("/projects/:id", getProjectById);
router.put("/projects/:id", ThumbnailUpload, updateProject);
router.delete("/projects/:id", deleteProject);

/* ===================== DIAGRAMS ===================== */

// all diagrams inside a project
router.get("/projects/:projectId/diagrams", getDiagramsByProjectController);

// all diagrams of logged-in user
router.get("/diagrams", getAllDiagramsByUserController);

// get soft deleted diagrams
router.get("/diagrams/trash", getAllSoftDeletedDiagramByUserController);

// get single diagram
router.get("/diagrams/:diagramId", getDiagramByIdController);

// incrementDiagramViews
router.get("/diagrams/:diagramId/public", getPublicDiagramController);

// create diagram
router.post("/diagrams", ThumbnailUpload, createDiagramController);
// update
router.put("/diagrams/:diagramId", ThumbnailUpload, updateDiagramController);

// soft delete diagram
router.delete("/diagrams/:diagramId", softDeleteDiagramController);

//restore deleted diagram
router.patch("/diagrams/:diagramId/restore", restoreDiagramController);
// hard delete diagram
router.delete("/admin/diagrams/:diagramId", hardDeleteUserDiagramController);

// mark diagram active/inactive (canvas session)
router.patch(
  "/diagrams/:diagramId/active",
  updateDiagramActiveStatusController,
);

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
