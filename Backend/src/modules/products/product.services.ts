import Parallel from "parallel-web";
import prisma from "../../config/prisma";

class ProductService {
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
        const raw = result?.output?.content?.output ?? result?.output?.content ?? result?.output ?? result;

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

    private normalizeProducts(data: any): { name: string; description: string }[] {
        if (!data?.products || !Array.isArray(data.products)) return [];

        const seen = new Set<string>();

        return data.products
            .filter((p: any) => p?.name && p?.description)
            .map((p: any) => ({
                name: p.name.trim(),
                description: p.description.trim(),
            }))
            .filter((p: any) => {
                const key = p.name.toLowerCase();
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            })
            .slice(0, 6);
    }

    private buildPrompt(company_name: string, domain: string, description: string): string {
        return `
You are an expert SaaS product analyst.

Extract the core products and offerings of the company.

Company Name: ${company_name}
Domain: ${domain}

Description:
${description}

Instructions:
- Identify REAL products or functional offerings (not generic words like "software", "platform")
- Break down the system into meaningful product components (e.g., agents, modules, systems)
- Keep names clear and concise
- Write short, precise descriptions
- Avoid repetition
- Maximum 6 products

Return STRICT JSON only, no markdown, no explanation:

{
  "company": "${company_name}",
  "domain": "${domain}",
  "products": [
    {
      "name": "",
      "description": ""
    }
  ]
}
    `.trim();
    }

    async getCompanyProducts(company_name: string, domain: string, description: string) {
        try {
            // CACHE CHECK
            const existing = await prisma.products.findUnique({
                where: { domain },
            });

            if (existing) {
                return existing.products_data;
            }

            // CREATE TASK
            const run = await this.parallel.taskRun.create({
                input: this.buildPrompt(company_name, domain, description),
                processor: "lite",
            });

            // WAIT FOR RESULT
            const result = await this.parallel.taskRun.result(run.run_id);

            const parsed = this.parseResult(result);
            const finalProducts = this.normalizeProducts(parsed);

            if (finalProducts.length === 0) {
                throw new Error("No valid products extracted");
            }

            const finalData = {
                company: company_name,
                domain,
                products: finalProducts,
            };

            // SAVE
            await prisma.products.upsert({
                where: { domain },
                update: { products_data: finalData },
                create: {
                    domain,
                    products_data: finalData,
                },
            });

            return finalData;

        } catch (err: any) {
            console.error("[ProductService] Error:", err.message);
            throw new Error(`Product extraction failed: ${err.message}`);
        }
    }
}

export default new ProductService();