import prisma from "../../config/prisma"

export class SavedService {
    // --- PERSONA FORENSICS ---
    async getSavedForensic(userId: string, type: string, reportId?: string, comparisonId?: string) {
        if (comparisonId && comparisonId !== "undefined") {
            return await prisma.personaForensic.findFirst({
                where: { user_id: userId, forensic_type: type, comparison_id: comparisonId }
            });
        }
        if (reportId && reportId !== "undefined") {
            return await prisma.personaForensic.findFirst({
                where: { user_id: userId, forensic_type: type, report_id: reportId }
            });
        }
        return null;
    }

    async saveForensic(userId: string, type: string, data: any, reportId?: string, comparisonId?: string, compareReportId?: string) {
        const existing = await this.getSavedForensic(userId, type, reportId, comparisonId);
        if (existing) {
            return await prisma.personaForensic.update({
                where: { id: existing.id }, data: { forensic_data: data, updated_at: new Date() }
            });
        }
        return await prisma.personaForensic.create({
            data: {
                user_id: userId, forensic_type: type, forensic_data: data,
                report_id: reportId && reportId !== "undefined" ? reportId : null,
                comparison_id: comparisonId && comparisonId !== "undefined" ? comparisonId : null,
                compare_report_id: compareReportId && compareReportId !== "undefined" ? compareReportId : null
            }
        });
    }

    // --- COMPANY FORENSICS ---
    async getCompanyForensic(userId: string, type: string, companyId?: string, comparisonId?: string) {
        if (comparisonId && comparisonId !== "undefined") {
            return await prisma.companyForensic.findFirst({
                where: { user_id: userId, forensic_type: type, comparison_id: comparisonId }
            });
        }
        if (companyId && companyId !== "undefined") {
            return await prisma.companyForensic.findFirst({
                where: { user_id: userId, forensic_type: type, company_id: companyId }
            });
        }
        return null;
    }

    async saveCompanyForensic(userId: string, type: string, data: any, companyId?: string, comparisonId?: string, compareCompanyId?: string) {
        const existing = await this.getCompanyForensic(userId, type, companyId, comparisonId);
        if (existing) {
            return await prisma.companyForensic.update({
                where: { id: existing.id }, data: { forensic_data: data, updated_at: new Date() }
            });
        }
        return await prisma.companyForensic.create({
            data: {
                user_id: userId, forensic_type: type, forensic_data: data,
                company_id: companyId && companyId !== "undefined" ? companyId : null,
                comparison_id: comparisonId && comparisonId !== "undefined" ? comparisonId : null,
                compare_company_id: compareCompanyId && compareCompanyId !== "undefined" ? compareCompanyId : null
            }
        });
    }
}