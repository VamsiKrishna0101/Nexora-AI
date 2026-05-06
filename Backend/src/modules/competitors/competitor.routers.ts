import express from 'express'
import competitorController from './competitor.controller'
const router = express.Router()

router.post("/", competitorController.getCompetitors)

export default router;