import express from "express";
import httpProxy from "express-http-proxy";
import { SERVICES } from "../config.js";

const router = express.Router();

// forward all /auth requests to auth-service
router.use("/", httpProxy(SERVICES.AUTH));

export default router;
