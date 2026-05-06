import express from 'express'
import companyjobsController from './companyjobs.controller'
const router = express.Router()

router.post("/getcompanyjobs", companyjobsController.getcompanyjobs)

export default router