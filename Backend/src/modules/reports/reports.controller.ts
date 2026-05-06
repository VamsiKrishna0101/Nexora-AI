import { Request, Response } from "express";
import prisma from "../../config/prisma";

export class ReportsController {
    /**
     * POST /api/reports
     * Saves a new intelligence report for the authenticated user.
     */
    async saveReport(req: Request, res: Response) {
        try {
            // @ts-ignore
            const user = req.user;
            if (!user) return res.status(401).json({ success: false, error: "Not authenticated" });

            const { domain, company_name, report_data, linkedin_id } = req.body;

            if (!domain || !company_name || !report_data) {
                return res.status(400).json({ success: false, error: "Missing required fields" });
            }

            // Optional Deduplication Check on Save (as a safety net)
            if (linkedin_id) {
                const existing = await prisma.report.findFirst({
                    where: { 
                        user_id: user.id,
                        linkedin_id: linkedin_id
                    }
                });
                if (existing) return res.status(200).json({ success: true, report: existing, cached: true });
            }

            const report = await prisma.report.create({
                data: {
                    user_id: user.id,
                    domain,
                    company_name,
                    report_data,
                    linkedin_id: linkedin_id || null,
                },
            });

            return res.status(201).json({ success: true, report });
        } catch (err: any) {
            console.error("[ReportsController] Save report error:", err.message);
            return res.status(500).json({ success: false, error: "Internal server error" });
        }
    }

    /**
     * GET /api/reports/check-existing
     * Checks if a report already exists for the user + linkedin_id.
     */
    async checkExisting(req: Request, res: Response) {
        try {
            // @ts-ignore
            const user = req.user;
            if (!user) return res.status(401).json({ success: false, error: "Not authenticated" });

            const { linkedin_id } = req.query;
            if (!linkedin_id) return res.status(400).json({ success: false, error: "linkedin_id is required" });

            const existing = await prisma.report.findFirst({
                where: { 
                    user_id: user.id,
                    linkedin_id: String(linkedin_id)
                }
            });

            if (existing) {
                return res.status(200).json({ success: true, exists: true, data: existing });
            }

            return res.status(200).json({ success: true, exists: false });
        } catch (err: any) {
            console.error("[ReportsController] Check existing error:", err.message);
            return res.status(500).json({ success: false, error: "Internal server error" });
        }
    }

    /**
     * GET /api/reports/my
     * Retrieves all reports for the authenticated user.
     */
    async getMyReports(req: Request, res: Response) {
        try {
            // @ts-ignore
            const user = req.user;
            if (!user) return res.status(401).json({ success: false, error: "Not authenticated" });

            const reports = await prisma.report.findMany({
                where: { user_id: user.id },
                orderBy: { created_at: "desc" },
            });

            return res.status(200).json({ success: true, data: reports });
        } catch (err: any) {
            console.error("[ReportsController] Get reports error:", err.message);
            return res.status(500).json({ success: false, error: "Internal server error" });
        }
    }

    /**
     * GET /api/reports/:id
     * Retrieves a specific report by ID.
     */
    async getReportById(req: Request, res: Response) {
         try {
            // @ts-ignore
            const user = req.user;
            if (!user) return res.status(401).json({ success: false, error: "Not authenticated" });

            const { id } = req.params;

            const report = await prisma.report.findUnique({
                where: { id },
            });

            if (!report) {
                 return res.status(404).json({ success: false, error: "Report not found" });
            }

            if (report.user_id !== user.id) {
                return res.status(403).json({ success: false, error: "Unauthorized access to report" });
            }

            return res.status(200).json({ success: true, data: report });
        } catch (err: any) {
            console.error("[ReportsController] Get report error:", err.message);
            return res.status(500).json({ success: false, error: "Internal server error" });
        }
    }
}

export default new ReportsController();
