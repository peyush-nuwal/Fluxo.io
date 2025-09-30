import express from "express";
import httpProxy from "express-http-proxy";
import { SERVICES } from "../config.js";

const router = express.Router();

// Forward all /docs requests to docs-service
router.use("/", httpProxy(SERVICES.DOCS));

export default router;
