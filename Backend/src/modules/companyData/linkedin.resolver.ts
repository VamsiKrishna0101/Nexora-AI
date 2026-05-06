import Parallel from "parallel-web";
import prisma from "../../config/prisma";

class LinkedInResolver {
    private parallel;

    constructor() {
        if (!process.env.PARALLEL_API_KEY) {
            throw new Error("PARALLEL_API_KEY missing");
        }
        this.parallel = new Parallel({
            apiKey: process.env.PARALLEL_API_KEY,
        });
    }

    private extractSlug(linkedinUrl: string): string | null {
        try {
            const match = linkedinUrl.match(/linkedin\.com\/company\/([^\/\?]+)/);
            return match ? match[1] : null;
        } catch {
            return null;
        }
    }

    /**
     * Resolves LinkedIn URL for a company.
     * Priority 1: socials.linkedin_url from company data
     * Priority 2: Construct from linkedin_id
     * Priority 3: Ask Parallel AI to find it via web search
     */
    async resolveLinkedInUrl(
        domain: string,
        company_name: string,
        company_data: any,
        manual_linkedin_url?: string
    ): Promise<{ linkedin_url: string | null; linkedin_slug: string | null }> {
        
        // --- Priority 0: Manual URL from user (SKIP ALL DISCOVERY) ---
        if (manual_linkedin_url && manual_linkedin_url.includes("linkedin.com")) {
            const rawUrl = manual_linkedin_url.trim().replace(/\/$/, "");
            const slug = this.extractSlug(rawUrl);
            
            // Persist immediately so it's cached for future calls
            await prisma.domain.upsert({
                where: { domain },
                update: { linkedin_url: rawUrl, linkedin_slug: slug },
                create: { domain, company_name, linkedin_url: rawUrl, linkedin_slug: slug }
            });

            console.log(`[LinkedInResolver] Using manual URL: ${rawUrl}`);
            return { linkedin_url: rawUrl, linkedin_slug: slug };
        }

        // Check if already resolved and stored
        const existing = await prisma.domain.findUnique({ where: { domain } });
        if (existing?.linkedin_url) {
            return {
                linkedin_url: existing.linkedin_url,
                linkedin_slug: existing.linkedin_slug
            };
        }

        let resolvedUrl: string | null = null;

        // --- Priority 1: from socials.linkedin_url ---
        const socialLinkedIn = company_data?.socials?.linkedin_url;
        if (socialLinkedIn && typeof socialLinkedIn === "string" && socialLinkedIn.includes("linkedin.com")) {
            resolvedUrl = socialLinkedIn.replace(/\/$/, "");
        }

        // --- Priority 2: Construct from linkedin_id ---
        if (!resolvedUrl) {
            const linkedinId = company_data?.socials?.linkedin_id;
            if (linkedinId) {
                resolvedUrl = `https://www.linkedin.com/company/${linkedinId}`;
            }
        }

        // --- Priority 3: Ask Parallel AI ---
        if (!resolvedUrl) {
            try {
                console.log(`[LinkedInResolver] Asking Parallel AI for LinkedIn URL of ${company_name}...`);
                const description = company_data?.description || "";

                const run = await this.parallel.taskRun.create({
                    input: `Find the official LinkedIn company page URL for the following company.
Return ONLY the LinkedIn URL (e.g. https://www.linkedin.com/company/stripe) — no explanation, no markdown.

Company Name: ${company_name}
Domain: ${domain}
Description: ${description.slice(0, 300)}`,
                    processor: "lite",
                });

                const result = await this.parallel.taskRun.result(run.run_id);

                const raw = result?.output?.content?.output ??
                    result?.output?.content ??
                    result?.output ??
                    result;

                if (typeof raw === "string" && raw.includes("linkedin.com/company/")) {
                    resolvedUrl = raw.trim().replace(/\/$/, "");
                }
            } catch (err: any) {
                console.error("[LinkedInResolver] Parallel AI failed:", err.message);
            }
        }

        // Extract slug from resolved URL
        const slug = resolvedUrl ? this.extractSlug(resolvedUrl) : null;

        // Save to Domain table
        if (resolvedUrl && existing) {
            await prisma.domain.update({
                where: { domain },
                data: {
                    linkedin_url: resolvedUrl,
                    linkedin_slug: slug,
                }
            });
        }

        console.log(`[LinkedInResolver] Resolved: ${resolvedUrl} (slug: ${slug})`);
        return { linkedin_url: resolvedUrl, linkedin_slug: slug };
    }
}

export default new LinkedInResolver();
