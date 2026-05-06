import { Router } from "express";
import { SavedController } from "./saved.controller";
import { verifyToken } from "../../middleware/auth.middleware";

const router = Router();
const savedController = new SavedController();

// Persona Forensics
router.get("/forensic/check", verifyToken, savedController.checkForensic);
router.post("/forensic/save", verifyToken, savedController.saveForensic);

// Company Forensics
router.get("/company-forensic/check", verifyToken, savedController.checkCompanyForensic);
router.post("/company-forensic/save", verifyToken, savedController.saveCompanyForensic);

export default router;
