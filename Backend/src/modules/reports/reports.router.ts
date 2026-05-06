import { Router } from "express";
import reportsController from "./reports.controller";
import { verifyToken } from "../../middleware/auth.middleware";

const reportsRouter = Router();

// Protect all report routes
reportsRouter.use(verifyToken);

reportsRouter.post("/", reportsController.saveReport.bind(reportsController));
reportsRouter.get("/my", reportsController.getMyReports.bind(reportsController));
reportsRouter.get("/check-existing", reportsController.checkExisting.bind(reportsController));
reportsRouter.get("/:id", reportsController.getReportById.bind(reportsController));

export default reportsRouter;
