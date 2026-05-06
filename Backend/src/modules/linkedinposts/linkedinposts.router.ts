import express from 'express'
import linkedinpostsController from './linkedinposts.controller'
const router = express.Router()

router.post("/getcompanyposts", linkedinpostsController.getcompanyposts)

export default router