import techstackServices from "./techstack.services";
import { Request, Response } from "express";

class TechStackController {
    async getTechStack(req: Request, res: Response) {
        const { domain } = req.body;
        if (!domain) {
            return res.status(400).json({
                success: false,
                message: "Domain is required"
            })
        }
        try {
            const result = await techstackServices.getTechStack(domain);
            return res.status(200).json({
                success: true,
                data: result.data
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            })
        }
    }
}
export default new TechStackController();