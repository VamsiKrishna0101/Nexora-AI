import Parallel from "parallel-web";
import prisma from "../../config/prisma";

export interface Competitor {
    name: string;
    domain: string;
    description: string | null;
    location: string | null;
}

export interface CompetitorsResult {
    success: boolean;
    data: Competitor[];
}

class CompetitorService {
    private parallel;

    constructor() {
        if (!process.env.PARALLEL_API_KEY) {
            throw new Error("PARALLEL_API_KEY missing");
        }
        this.parallel = new Parallel({
            apiKey: process.env.PARALLEL_API_KEY,
        });
    }

    private parseResult(result: any): any {
        const raw =
            result?.output?.content?.output ??
            result?.output?.content ??
            result?.output ??
            result;

        if (!raw) return null;

        if (typeof raw === "string") {
            try {
                return JSON.parse(raw.replace(/```json|```/g, "").trim());
            } catch {
                return null;
            }
        }

        if (typeof raw === "object") return raw;

        return null;
    }

    private isValidDomain(domain: string): boolean {
        // must look like a real domain: letters, dots, no spaces, no garbage chars
        return /^[a-z0-9][a-z0-9\-\.]+\.[a-z]{2,}$/.test(domain);
    }

    private normalizeCompetitors(data: any): Competitor[] {
        if (!data?.competitors || !Array.isArray(data.competitors)) return [];

        const seen = new Set<string>();

        return data.competitors
            .filter((c: any) => c?.name && c?.domain)
            .map((c: any) => ({
                name: c.name.trim(),
                domain: c.domain.trim().toLowerCase()
                    .replace(/^https?:\/\//, "")
                    .replace(/^www\./, "")
                    .replace(/\/$/, "")
                    .split("/")[0], // strip any path
                description: c.description?.trim() ?? null,
                location: (c.location && c.location.trim() !== "")
                    ? c.location.trim()
                    : null,
            }))
            .filter((c: any) => {
                // skip invalid or duplicate domains
                if (!this.isValidDomain(c.domain)) return false;
                if (seen.has(c.domain)) return false;
                seen.add(c.domain);
                return true;
            })
            .slice(0, 6);
    }

    private buildPrompt(company_name: string, domain: string, description: string): string {
        return `
You are a market research analyst.

Find the top direct competitors of this company.

Company: ${company_name}
Domain: ${domain}
Description: ${description}

Instructions:
- Find REAL companies that directly compete in the same market
- Only include companies with actual products/services that overlap
- Include both large incumbents and similar-sized startups
- Maximum 6 competitors
- For domain: use the company's known website domain (e.g. "omnea.com") — never use "unavailable"
- For location: research and provide city + country for every competitor — do not leave it empty
- For description: 1-2 sentences max, focus on what makes them a direct competitor

Return STRICT JSON only, no markdown, no explanation:

{
  "competitors": [
    {
      "name": "",
      "domain": "",
      "description": "",
      "location": ""
    }
  ]
}
        `.trim();
    }

    async getCompetitors(
        company_name: string,
        domain: string,
        description: string
    ): Promise<CompetitorsResult> {
        try {
            const normalizedDomain = domain
                .replace(/^https?:\/\//, "")
                .replace(/^www\./, "")
                .replace(/\/$/, "")
                .toLowerCase();

            // CACHE CHECK
            const existing = await prisma.competitors.findUnique({
                where: { domain: normalizedDomain },
            });

            if (existing) {
                return { success: true, data: existing.competitors_data as any };
            }

            // RUN TASK
            const run = await this.parallel.taskRun.create({
                input: this.buildPrompt(company_name, normalizedDomain, description),
                processor: "lite",
            });

            // WAIT FOR RESULT
            const result = await this.parallel.taskRun.result(run.run_id);

            const parsed = this.parseResult(result);
            const finalCompetitors = this.normalizeCompetitors(parsed);

            if (finalCompetitors.length === 0) {
                throw new Error("No valid competitors extracted");
            }

            // SAVE
            await prisma.competitors.upsert({
                where: { domain: normalizedDomain },
                update: { competitors_data: finalCompetitors },
                create: {
                    domain: normalizedDomain,
                    competitors_data: finalCompetitors,
                },
            });

            return { success: true, data: finalCompetitors };

        } catch (err: any) {
            console.error("[CompetitorService] Error:", err.message);
            return { success: false, data: [] };
        }
    }
}

export default new CompetitorService();