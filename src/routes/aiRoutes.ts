import express from "express";
import { askAIAssistant } from "../controllers/aiController.js";

const router = express.Router();

router.post("/assistant", askAIAssistant);

export default router;
