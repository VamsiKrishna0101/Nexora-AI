import companyServices from "../companyData/companyservices";
import linkedInResolver from "../companyData/linkedin.resolver";
import employeeService from "../companyEmployees/employee.services";
import linkedinPostsService from "../linkedinposts/linkedinposts.services";
import productService from "../products/product.services";
import competitorService from "../competitors/competitor.services";
import techStackService from "../techstack/techstack.services";
import financeService from "../financials/finance.services";
import newsService from "../newsfeed/newsfeed.services";
import companyJobService from "../companyjobs/companyjobs.services";
import { TimelineService } from "../businesstimeline/timeline.services";
import prisma from "../../config/prisma";

const timelineService = new TimelineService();

export interface GatherResult {
    domain: string;
    gathered: string[];
    skipped: string[];
    failed: string[];
}

export interface MegaObject {
    domain: string;
    company_data: any;
    linkedin_url: string | null;
    linkedin_slug: string | null;
    products: any;
    competitors: any;
    techstack: any;
    financials: any;
    newsfeed: any;
    employees: any;
    linkedin_posts: any;
    company_jobs: any;
    timeline: any;
}

class GatherService {

    /**
     * Gathers and caches ALL data for a company domain.
     * Designed to be called when a user first clicks on a company.
     */
    async gatherAll(domain: string, manual_linkedin_url?: string): Promise<GatherResult> {
        const gathered: string[] = [];
        const skipped: string[] = [];
        const failed: string[] = [];

        // --- Step 1: Get company data (required first) ---
        let companyData: any = null;
        let companyName = "";
        let description = "";

        try {
            companyData = await companyServices.getCompanyInfo(domain);
            companyName = companyData?.name || domain;
            description = companyData?.description || "";
            gathered.push("company_data");
        } catch (err: any) {
            console.error("[GatherService] company_data failed:", err.message);
            failed.push("company_data");
        }

        // --- Step 2: Resolve LinkedIn URL (using Parallel AI if needed) ---
        let linkedinUrl: string | null = null;
        let linkedinSlug: string | null = null;

        try {
            const resolved = await linkedInResolver.resolveLinkedInUrl(domain, companyName, companyData, manual_linkedin_url);
            linkedinUrl = resolved.linkedin_url;
            linkedinSlug = resolved.linkedin_slug;
            if (linkedinUrl) {
                gathered.push("linkedin_url");
            } else {
                skipped.push("linkedin_url");
            }
        } catch (err: any) {
            console.error("[GatherService] linkedin_resolver failed:", err.message);
            failed.push("linkedin_url");
        }

        // --- Step 3: Run all domain-based sources in parallel ---
        const domainTasks = await Promise.allSettled([
            productService.getCompanyProducts(companyName, domain, description)
                .then(d => ({ key: "products", data: d })),

            competitorService.getCompetitors(companyName, domain, description)
                .then(d => ({ key: "competitors", data: d })),

            techStackService.getTechStack(domain)
                .then(d => ({ key: "techstack", data: d })),

            financeService.getFinancials(domain, companyName, description)
                .then(d => ({ key: "financials", data: d })),

            newsService.getCompanyNews(companyName, domain, description)
                .then(d => ({ key: "newsfeed", data: d })),

            timelineService.getCompanyTimeline({ company_name: companyName, domain, description })
                .then(d => ({ key: "timeline", data: d })),
        ]);

        for (const result of domainTasks) {
            if (result.status === "fulfilled") {
                gathered.push(result.value.key);
            } else {
                console.error(`[GatherService] Task failed:`, result.reason);
                failed.push("unknown_domain_task");
            }
        }

        // --- Step 4: LinkedIn-dependent sources (run only if LinkedIn URL resolved) ---
        if (linkedinUrl) {
            const linkedinTasks = await Promise.allSettled([
                employeeService.getCompanyPeople(linkedinUrl)
                    .then(d => ({ key: "employees", data: d })),

                linkedinPostsService.getCompanyPosts(linkedinUrl)
                    .then(d => ({ key: "linkedin_posts", data: d })),
            ]);

            for (const result of linkedinTasks) {
                if (result.status === "fulfilled") {
                    gathered.push(result.value.key);
                } else {
                    console.error(`[GatherService] LinkedIn task failed:`, result.reason);
                    failed.push("linkedin_dependent_task");
                }
            }

            // Jobs need the slug, not the full URL
            if (linkedinSlug) {
                try {
                    await companyJobService.getcompanyjobs(linkedinSlug, domain);
                    gathered.push("company_jobs");
                } catch (err: any) {
                    console.error("[GatherService] company_jobs failed:", err.message);
                    failed.push("company_jobs");
                }
            } else {
                skipped.push("company_jobs");
            }
        } else {
            skipped.push("employees", "linkedin_posts", "company_jobs");
        }

        console.log(`[GatherService] Done for ${domain}. Gathered: ${gathered.length}, Skipped: ${skipped.length}, Failed: ${failed.length}`);

        return { domain, gathered, skipped, failed };
    }

    /**
     * Reads ALL cached data for a domain and assembles the Mega-Object.
     * Designed to be called by the Python Agent when generating a report.
     */
    async readAll(domain: string): Promise<MegaObject> {
        const domainRecord = await prisma.domain.findUnique({ where: { domain } });

        const [
            company,
            products,
            competitors,
            techstack,
            financials,
            newsfeed,
            employees,
            linkedinPosts,
            companyJobs,
            timeline,
        ] = await Promise.all([
            prisma.company.findFirst({ where: { domain: { domain } } }),
            prisma.products.findUnique({ where: { domain } }),
            prisma.competitors.findUnique({ where: { domain } }),
            prisma.techStack.findUnique({ where: { domain } }),
            prisma.financials.findUnique({ where: { domain } }),
            prisma.newsfeed.findUnique({ where: { domain } }),
            domainRecord?.linkedin_url
                ? prisma.employees.findUnique({ where: { linkedinurl: domainRecord.linkedin_url } })
                : null,
            domainRecord?.linkedin_url
                ? prisma.linkedinPosts.findUnique({ where: { linkedinurl: domainRecord.linkedin_url } })
                : null,
            prisma.companyJobs.findUnique({ where: { domain } }),
            prisma.timeline.findUnique({ where: { domain } }),
        ]);

        return {
            domain,
            company_data: company?.company_data ?? null,
            linkedin_url: domainRecord?.linkedin_url ?? null,
            linkedin_slug: domainRecord?.linkedin_slug ?? null,
            products: products?.products_data ?? null,
            competitors: competitors?.competitors_data ?? null,
            techstack: techstack?.tech_data ?? null,
            financials: financials?.financials_data ?? null,
            newsfeed: newsfeed?.news_data ?? null,
            employees: employees?.employees_data ?? null,
            linkedin_posts: linkedinPosts?.posts_data ?? null,
            company_jobs: companyJobs?.jobs_data ?? null,
            timeline: timeline?.timeline_data ?? null,
        };
    }
}

export default new GatherService();
