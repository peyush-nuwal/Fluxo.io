import express from "express";
import httpProxy from "express-http-proxy";
import { SERVICES } from "../config.js";

const router = express.Router();

// Forward all /user requests to user-service
router.use("/", httpProxy(SERVICES.USER));

export default router;
