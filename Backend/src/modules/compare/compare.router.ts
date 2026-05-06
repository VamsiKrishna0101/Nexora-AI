import { Router } from "express";
import compareController from "./compare.controller";
import { verifyToken } from "../../middleware/auth.middleware";

const compareRouter = Router();

compareRouter.use(verifyToken);

compareRouter.post("/", compareController.saveComparison.bind(compareController));
compareRouter.post("/find", compareController.findExistingComparison.bind(compareController));
compareRouter.get("/:id", compareController.getComparison.bind(compareController));

export default compareRouter;
