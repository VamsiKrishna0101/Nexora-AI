import { Request, Response } from "express";
import prisma from "../../config/prisma";

class CompareController {
    async saveComparison(req: Request, res: Response) {
        try {
            const { report1_id, report2_id, comparison_data } = req.body;
            const userId = (req as any).user.id;

            if (!report1_id || !report2_id || !comparison_data) {
                return res.status(400).json({ success: false, error: "Missing required fields" });
            }

            const comparison = await prisma.personaComparison.create({
                data: {
                    user_id: userId,
                    report1_id,
                    report2_id,
                    comparison_data
                }
            });

            return res.status(201).json({ success: true, comparison });
        } catch (error: any) {
            console.error("[CompareController] Error saving comparison:", error);
            return res.status(500).json({ success: false, error: error.message });
        }
    }

    async getComparison(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const comparison = await prisma.personaComparison.findUnique({
                where: { id }
            });

            if (!comparison) {
                return res.status(404).json({ success: false, error: "Comparison not found" });
            }

            return res.status(200).json({ success: true, comparison });
        } catch (error: any) {
            console.error("[CompareController] Error fetching comparison:", error);
            return res.status(500).json({ success: false, error: error.message });
        }
    }

    async findExistingComparison(req: Request, res: Response) {
        try {
            const { report1_id, report2_id } = req.body;
            const userId = (req as any).user.id;

            if (!report1_id || !report2_id) {
                return res.status(400).json({ success: false, error: "Missing report IDs" });
            }

            // Check both combinations (A-B and B-A)
            const comparison = await prisma.personaComparison.findFirst({
                where: {
                    user_id: userId,
                    OR: [
                        { report1_id, report2_id },
                        { report1_id: report2_id, report2_id: report1_id }
                    ]
                },
                orderBy: { created_at: "desc" }
            });

            return res.status(200).json({ success: true, comparison });
        } catch (error: any) {
            console.error("[CompareController] Error finding existing comparison:", error);
            return res.status(500).json({ success: false, error: error.message });
        }
    }
}

export default new CompareController();
