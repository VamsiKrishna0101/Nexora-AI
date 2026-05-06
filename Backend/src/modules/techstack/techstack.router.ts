import express from 'express'
import techstackController from './techstack.controller'
const router = express.Router();
router.post("/", techstackController.getTechStack);
export default router;