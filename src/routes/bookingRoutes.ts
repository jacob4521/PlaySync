import express from "express";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import {
  createBooking,
  getAvailability,
} from "../controllers/bookingController.js";

const router = express.Router();

router.post("/", authenticateToken, createBooking);
router.get("/availability", getAvailability);

export default router;
