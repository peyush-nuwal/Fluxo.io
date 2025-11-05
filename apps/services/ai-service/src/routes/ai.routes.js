import { Router } from "express";
import { generateDiagram } from "../controllers/ai.controller.js";

const router = Router();

router.post("/api/v1/ai/generate-diagram", generateDiagram);

export default router;
