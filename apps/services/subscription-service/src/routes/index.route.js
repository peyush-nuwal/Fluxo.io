import { Router } from "express";
import {
  createOrder,
  verifyPayment,
} from "../controllers/subscription.controller.js";

const router = Router();

// POST /api/v1/subscription/order
router.post("/order", createOrder);

// POST /api/v1/subscription/verify
router.post("/verify", verifyPayment);

export default router;
