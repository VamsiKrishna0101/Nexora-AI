import { Router } from "express";
import NewsController from "./newsfeed.controller";

const router = Router();

// POST /api/news
router.post("/", NewsController.getNews);

export default router;