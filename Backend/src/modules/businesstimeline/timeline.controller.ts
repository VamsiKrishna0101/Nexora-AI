import { Request, Response } from "express";
import TimeLineServices from './timeline.services'
class TimeLineController {
    async getTimeline(req: Request, res: Response) {
        try {
            const { company_name, domain, description } = req.body;
            console.log(req.body)
            if (!company_name || !domain) {
                return res.status(400).json({
                    success: false,
                    error: "company_name and domain are required",
                });
            }

            const data = await TimeLineServices.getCompanyTimeline({
                company_name,
                domain,
                description: description || "",
            });

            return res.status(200).json(data);


        } catch (err: any) {
            return res.status(500).json({
                success: false,
                error: err.message,
            });
        }
    }
}

export default new TimeLineController();