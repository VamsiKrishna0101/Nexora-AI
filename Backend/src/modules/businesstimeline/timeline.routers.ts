import { Router } from "express";
import TimeLineController from "./timeline.controller";

const router = Router();

// POST /api/timeline
router.post("/", TimeLineController.getTimeline);

export default router;