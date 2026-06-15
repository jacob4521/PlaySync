import express from "express";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { createArena, getArenas } from "../controllers/arenaController.js";

const router = express.Router();

router.post("/", authenticateToken, createArena);
router.get("/", getArenas);

export default router;
