import { Router } from "express";
import EmployeeController from './employee.controller'
const router = Router();

// POST /api/employees
router.post("/getemployees", EmployeeController.getEmployees);

export default router;