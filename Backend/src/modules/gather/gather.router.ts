import { Router } from "express";
import gatherController from "./gather.controller";
import { verifyToken, verifyInternalSecret } from "../../middleware/auth.middleware";

const gatherRouter = Router();

// POST /api/gather/company → trigger full data gather (called when user clicks a company)
gatherRouter.post("/company", verifyToken, gatherController.gatherCompany.bind(gatherController));

// GET /api/gather/read?domain=lio.ai → read all cached data (called by Python Agent)
gatherRouter.get("/read", verifyInternalSecret, gatherController.readCompany.bind(gatherController));


export default gatherRouter;
