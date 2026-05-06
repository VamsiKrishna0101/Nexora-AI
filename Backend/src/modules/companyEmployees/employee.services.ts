import axios from "axios";
import prisma from "../../config/prisma";

export interface Employee {
    name: string;
    title: string;
    email: string | null;
    company: string;
    linkedin_url?: string | null;
    image_url?: string | null;
}

export interface EmployeeResult {
    success: boolean;
    data: Employee[];
}

export class EmployeeService {
    private apiToken: string;

    constructor() {
        if (!process.env.APIFY_TOKEN) {
            throw new Error("APIFY_TOKEN missing");
        }
        this.apiToken = process.env.APIFY_TOKEN;
    }

    async getCompanyPeople(linkedinUrl: string): Promise<EmployeeResult> {
        try {
            const normalizedUrl = linkedinUrl.replace(/\/$/, "");

            const existing = await prisma.employees.findUnique({
                where: { linkedinurl: normalizedUrl },
            });

            if (existing) {
                return {
                    success: true,
                    data: existing.employees_data as any,
                };
            }

            const run = await axios.post(
                `https://api.apify.com/v2/acts/Vb6LZkh4EqRlR0Ka9/runs?token=${this.apiToken}`,
                {
                    companies: [normalizedUrl],
                    maxItems: 15,
                    profileScraperMode: "Short ($4 per 1k)",
                    recentlyChangedJobs: false,
                    excludeSeniorityLevelIds: ["100", "110"],
                }
            );

            const runId = run.data.data.id;
            const datasetId = run.data.data.defaultDatasetId;

            let status = "RUNNING";

            while (status === "RUNNING" || status === "READY") {
                await new Promise((r) => setTimeout(r, 3000));

                const check = await axios.get(
                    `https://api.apify.com/v2/actor-runs/${runId}?token=${this.apiToken}`
                );

                status = check.data.data.status;

                if (status === "SUCCEEDED") break;
                if (status === "FAILED") throw new Error("Apify run failed");
            }

            const res = await axios.get(
                `https://api.apify.com/v2/datasets/${datasetId}/items?token=${this.apiToken}`
            );

            const raw = res.data || [];

            const data: Employee[] = raw.map((item: any) => ({
                name: `${item.firstName || ""} ${item.lastName || ""}`.trim() || "Unknown",
                title: item.currentPositions?.[0]?.title || "Unknown",
                email: null,
                company: item.currentPositions?.[0]?.companyName || "",
                linkedin_url: item.linkedinUrl || null,
                image_url: item.pictureUrl || null,
            }));

            await prisma.employees.upsert({
                where: { linkedinurl: normalizedUrl },
                update: { employees_data: data },
                create: {
                    linkedinurl: normalizedUrl,
                    employees_data: data,
                },
            });

            return { success: true, data };

        } catch (err: any) {
            console.error("[EmployeeService] Error:", err.response?.data || err.message);
            return { success: false, data: [] };
        }
    }
}

export default new EmployeeService();