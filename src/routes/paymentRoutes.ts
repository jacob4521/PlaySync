import express from "express";
import { checkoutSession } from "../controllers/paymentController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/checkout-session", authenticateToken, checkoutSession);

export default router;
