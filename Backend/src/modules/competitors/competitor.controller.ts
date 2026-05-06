import { Request, Response } from "express";
import competitorServices from "./competitor.services";

export class CompetitorController {
    async getCompetitors(req: Request, res: Response) {
        const { company_name, domain, description } = req.body
        try {
            if (!company_name || !domain) {
                return res.status(400).json({
                    success: false,
                    message: "company name and domain required"
                })
            }
            const result = await competitorServices.getCompetitors(company_name, domain, description)
            return res.status(200).json({
                success: true,
                data: result
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "internal server error"
            })
        }
    }
}
export default new CompetitorController();