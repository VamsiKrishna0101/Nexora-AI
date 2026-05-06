import { Request, Response } from "express";
import gatherService from "./gather.service";

class GatherController {
    /**
     * POST /api/gather/company
     * Triggers full data gathering for a domain. Stores everything in DB.
     */
    async gatherCompany(req: Request, res: Response) {
        const { domain, manual_linkedin_url } = req.body;

        if (!domain) {
            return res.status(400).json({ success: false, error: "domain is required" });
        }

        try {
            const result = await gatherService.gatherAll(domain, manual_linkedin_url);
            return res.status(200).json({ success: true, ...result });
        } catch (err: any) {
            console.error("[GatherController] gatherCompany failed:", err.message);
            return res.status(500).json({ success: false, error: err.message });
        }
    }

    /**
     * GET /api/gather/read?domain=lio.ai
     * Reads all cached data and returns the Mega-Object.
     * Called by the Python Agent before generating a Deep Dive report.
     */
    async readCompany(req: Request, res: Response) {
        const domain = req.query.domain as string;

        if (!domain) {
            return res.status(400).json({ success: false, error: "domain query param is required" });
        }

        try {
            const megaObject = await gatherService.readAll(domain);
            return res.status(200).json({ success: true, data: megaObject });
        } catch (err: any) {
            console.error("[GatherController] readCompany failed:", err.message);
            return res.status(500).json({ success: false, error: err.message });
        }
    }
}

export default new GatherController();
