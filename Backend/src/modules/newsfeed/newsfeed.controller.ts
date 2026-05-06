import { Request, Response } from "express";
import NewsService from "./newsfeed.services";

class NewsController {
    async getNews(req: Request, res: Response) {
        try {
            const { company_name, domain, description } = req.body;

            if (!company_name || !domain) {
                return res.status(400).json({
                    success: false,
                    error: "company_name and domain are required",
                });
            }

            const result = await NewsService.getCompanyNews(
                company_name,
                domain,
                description
            );

            return res.status(200).json(result);

        } catch (err: any) {
            return res.status(500).json({
                success: false,
                error: err.message,
            });
        }
    }
}

export default new NewsController();