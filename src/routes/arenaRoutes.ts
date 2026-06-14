import express from "express";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { createArena } from "../controllers/arenaController.js";

const router = express.Router();

router.post("/", authenticateToken, createArena);

export default router;