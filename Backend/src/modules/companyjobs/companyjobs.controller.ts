import companyjobsServices from "./companyjobs.services";
import { Request, Response } from "express";

class CompanyJobsController {
    async getcompanyjobs(req: Request, res: Response) {
        try {
            const { slug } = req.body
            if (!slug) {
                return res.status(400).json({
                    success: false,
                    message: "slug is required"
                })
            }
            const result = await companyjobsServices.getcompanyjobs(slug)
            return res.status(200).json({
                success: true,
                data: result
            })
        } catch (error) {
            console.log(error)
            return res.status(500).json({
                sucess: false,
                message: "Internal server error"
            })
        }
    }
}
export default new CompanyJobsController();