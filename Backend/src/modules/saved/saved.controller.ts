import { Request, Response } from "express";
import { SavedService } from "./saved.services";

const savedService = new SavedService();

export class SavedController {
    // --- PERSONA ---
    async checkForensic(req: Request, res: Response) {
        try {
            const { id: userId } = (req as any).user;
            const { type, reportId, comparisonId } = req.query;
            const insight = await savedService.getSavedForensic(userId, type as string, reportId as string, comparisonId as string);
            return res.json({ success: true, data: insight });
        } catch (error: any) {
            console.error("[SavedController] checkForensic error:", error);
            return res.status(500).json({ success: false, error: error.message });
        }
    }

    async saveForensic(req: Request, res: Response) {
        try {
            const { id: userId } = (req as any).user;
            const { type, data, reportId, comparisonId, compareReportId } = req.body;
            const saved = await savedService.saveForensic(userId, type, data, reportId, comparisonId, compareReportId);
            return res.json({ success: true, data: saved });
        } catch (error: any) {
            console.error("[SavedController] saveForensic error:", error);
            return res.status(500).json({ success: false, error: error.message });
        }
    }

    // --- COMPANY ---
    async checkCompanyForensic(req: Request, res: Response) {
        try {
            const { id: userId } = (req as any).user;
            const { type, companyId, comparisonId } = req.query;
            const insight = await savedService.getCompanyForensic(userId, type as string, companyId as string, comparisonId as string);
            return res.json({ success: true, data: insight });
        } catch (error: any) {
            console.error("[SavedController] checkCompanyForensic error:", error);
            return res.status(500).json({ success: false, error: error.message });
        }
    }

    async saveCompanyForensic(req: Request, res: Response) {
        try {
            const { id: userId } = (req as any).user;
            const { type, data, companyId, comparisonId, compareCompanyId } = req.body;
            const saved = await savedService.saveCompanyForensic(userId, type, data, companyId, comparisonId, compareCompanyId);
            return res.json({ success: true, data: saved });
        } catch (error: any) {
            console.error("[SavedController] saveCompanyForensic error:", error);
            return res.status(500).json({ success: false, error: error.message });
        }
    }
}
