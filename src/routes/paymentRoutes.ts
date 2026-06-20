import express from "express";
import {
  checkoutSession,
  handleWebhook,
} from "../controllers/paymentController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  handleWebhook,
);

router.use(express.json());
router.post("/checkout-session", authenticateToken, checkoutSession);

export default router;
