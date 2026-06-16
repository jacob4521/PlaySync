import express from "express";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import {
  createBooking,
  getAvailability,
  getBookingsByPlayerId,
} from "../controllers/bookingController.js";

const router = express.Router();

router.post("/", authenticateToken, createBooking);
router.get("/availability", getAvailability);
router.get("/my-bookings", authenticateToken, getBookingsByPlayerId);

export default router;
