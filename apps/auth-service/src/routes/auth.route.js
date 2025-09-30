import express from "express";
import { signUp, signIn, signOut } from "../controller/auth.controller.js";

const router = express.Router();

// Auth routes
router.post("/api/v1/auth/signup", signUp);
router.post("/api/v1/auth/signin", signIn);
router.post("/api/v1/auth/signout", signOut);

export default router;
