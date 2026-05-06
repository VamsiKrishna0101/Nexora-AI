import express from 'express'
import financeController from './finance.controller'
const router = express.Router()

router.post("/getfinancedata", financeController.getFinancedata)

export default router