import { Request, Response, NextFunction } from 'express';
import CompanyServices from './companyservices';
import prisma from "../../config/prisma";


class CompanyController {
    /**
     * Get domain suggestions for a company name
     */
    async suggestCompany(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { name } = req.query;

            if (!name || typeof name !== 'string') {
                res.status(400).json({
                    success: false,
                    error: 'Company name is required as a query parameter string'
                });
                return;
            }

            const data = await CompanyServices.getDomainofCompany(name);

            res.status(200).json({
                success: true,
                data
            });
        } catch (error) {
            next(error);
        }
    }
    async getcompany(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { domain } = req.body;
            // @ts-ignore
            const userId = req.user?.id;
            
            if (!domain || typeof domain !== 'string') {
                res.status(400).json({ success: false, error: "Domain is required as a string in the body" });
                return;
            }
            
            const data = await CompanyServices.getCompanyInfo(domain);
            
            if (!data) {
                res.status(404).json({ success: false, error: "Company not found" });
                return;
            }

            // Save Search History if userId is present
            if (userId) {
                try {
                    await prisma.savedCompany.upsert({
                        where: {
                            user_id_domain_report_type: {
                                user_id: userId,
                                domain: domain,
                                report_type: "PARTIAL"
                            }
                        },

                        update: {
                            updated_at: new Date()
                        },
                        create: {
                            user_id: userId,
                            domain: domain,
                            company_name: data.name || domain,
                            logo_url: data.logo_url || null,
                            description: data.description || data.seo_description || null,
                            report_type: "PARTIAL"
                        }
                    });
                } catch (dbErr) {
                    console.error("[CompanyController] Failed to save search history:", dbErr);
                }
            }
            
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get all companies saved/viewed by the current user
     */
    async getMyCompanies(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // @ts-ignore
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ success: false, error: "Unauthorized" });
                return;
            }

            if (!prisma.savedCompany) {
                console.error("CRITICAL: prisma.savedCompany is UNDEFINED. Available models:", Object.keys(prisma).filter(k => !k.startsWith('_')));
                throw new Error("Persistance service unavailable");
            }

            const companies = await prisma.savedCompany.findMany({
                where: { user_id: userId },
                orderBy: { created_at: 'desc' }
            });


            res.status(200).json({
                success: true,
                data: companies
            });
        } catch (error) {
            next(error);
        }
    }
    /**
     * Save a Full Agentic Deep Dive Report (12 sections)
     */
    async saveFullReport(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { domain, company_name, report_data } = req.body;
            // @ts-ignore
            const userId = req.user?.id;

            if (!userId) {
                res.status(401).json({ success: false, error: "Unauthorized" });
                return;
            }

            if (!domain || !report_data) {
                res.status(400).json({ success: false, error: "domain and report_data are required" });
                return;
            }

            const report = await prisma.companyIntelligenceReport.upsert({
                where: {
                    user_id_domain: {
                        user_id: userId,
                        domain: domain
                    }
                },
                update: {
                    report_data: report_data,
                    company_name: company_name || domain,
                    updated_at: new Date()
                },
                create: {
                    user_id: userId,
                    domain: domain,
                    company_name: company_name || domain,
                    report_data: report_data
                }
            });

            // Also update search history to reflect DEEP_DIVE status
            const savedCompany = await prisma.savedCompany.upsert({
                where: {
                    user_id_domain_report_type: {
                        user_id: userId,
                        domain: domain,
                        report_type: "DEEP_DIVE"
                    }
                },
                update: {
                    updated_at: new Date()
                },
                create: {
                    user_id: userId,
                    domain: domain,
                    company_name: company_name || domain,
                    report_type: "DEEP_DIVE"
                }
            });

            res.status(200).json({ success: true, report, saved_company_id: savedCompany.id });
        } catch (error) {
            next(error);
        }
    }


    /**
     * Get a specific Full Agentic Report by domain
     */
    async getFullReport(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { domain } = req.params;
            // @ts-ignore
            const userId = req.user?.id;

            if (!userId) {
                res.status(401).json({ success: false, error: "Unauthorized" });
                return;
            }

            const report = await prisma.companyIntelligenceReport.findUnique({
                where: {
                    user_id_domain: {
                        user_id: userId,
                        domain: domain
                    }
                }
            });

            if (!report) {
                res.status(404).json({ success: false, error: "Deep Dive report not found" });
                return;
            }

            res.status(200).json({ success: true, data: report });
        } catch (error) {
            next(error);
        }
    }
    /**
     * Check if a report exists for a domain (PARTIAL or DEEP_DIVE)
     */
    async checkExistingReport(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { domain } = req.query;
            // @ts-ignore
            const userId = req.user?.id;

            if (!userId) {
                res.status(401).json({ success: false, error: "Unauthorized" });
                return;
            }

            if (!domain || typeof domain !== 'string') {
                res.status(400).json({ success: false, error: "Domain query parameter is required" });
                return;
            }

            // Check for Full Report first
            const fullReport = await prisma.companyIntelligenceReport.findUnique({
                where: {
                    user_id_domain: {
                        user_id: userId,
                        domain: domain
                    }
                },
                select: { id: true, updated_at: true }
            });

            // Check search history for PARTIAL or DEEP_DIVE status
            const savedHistory = await prisma.savedCompany.findFirst({
                where: { 
                    user_id: userId, 
                    domain: domain 
                },
                orderBy: { created_at: 'desc' }
            });

            res.status(200).json({
                success: true,
                exists: !!fullReport || !!savedHistory,
                type: fullReport ? "DEEP_DIVE" : (savedHistory?.report_type || "NONE"),
                last_updated: fullReport?.updated_at || savedHistory?.updated_at || null
            });
        } catch (error) {
            next(error);
        }
    }

}

export default new CompanyController();
