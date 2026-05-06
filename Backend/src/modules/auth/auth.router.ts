import { Router } from "express";
import authController from "./auth.controller";
import { verifyToken } from "../../middleware/auth.middleware";

const authRouter = Router();

authRouter.post("/register", authController.register.bind(authController));
authRouter.post("/login", authController.login.bind(authController));
authRouter.get("/me", verifyToken, authController.me.bind(authController));

export default authRouter;
