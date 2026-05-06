import { Router } from 'express';
import CompanyController from './companycontroller';

const router = Router();

// Route: GET /api/companies/suggest
// Description: Returns domain suggestions for a given company name
router.get('/suggest', CompanyController.suggestCompany);
router.get('/my', CompanyController.getMyCompanies);
router.post("/getcompany", CompanyController.getcompany);

// Deep Dive (Agentic)
router.get("/check-existing", CompanyController.checkExistingReport);
router.post("/save-full-report", CompanyController.saveFullReport);
router.get("/full-report/:domain", CompanyController.getFullReport);

export default router;