import axios from "axios";
import dotenv from "dotenv";
import prisma from "../../config/prisma";

dotenv.config();

class CompanyJobService {
    async getcompanyjobs(slug: string, domain: string) {
        try {
            // CACHE CHECK
            const existing = await prisma.companyJobs.findUnique({ where: { domain } });
            if (existing) {
                return existing.jobs_data;
            }
            const options = {
                method: "GET",
                url: "https://linkedin-job-search-api.p.rapidapi.com/active-jb-6m",
                params: {
                    limit: "50", // 🔥 safer limit
                    offset: "0",
                    organization_slug_filter: slug
                    // ❌ removed description_type (huge payload)
                },
                headers: {
                    "x-rapidapi-key": process.env.RAPID_API_KEY!,
                    "x-rapidapi-host": "linkedin-job-search-api.p.rapidapi.com",
                    "Content-Type": "application/json"
                }
            };

            const response = await axios.request(options);
            const rawJobs = response.data;

            // 🔥 Step 1: Remove duplicates
            const uniqueJobsMap = new Map();

            for (const job of rawJobs) {
                if (!uniqueJobsMap.has(job.id)) {
                    uniqueJobsMap.set(job.id, job);
                }
            }

            const uniqueJobs = Array.from(uniqueJobsMap.values());

            // 🔥 Step 2: Normalize data
            const cleanedJobs = uniqueJobs.map((job: any) => ({
                job_id: Number(job.id),
                title: job.title,

                company: {
                    name: job.organization,
                    industry: job.linkedin_org_industry || null,
                    size: job.linkedin_org_size || null,
                    headquarters: job.linkedin_org_headquarters || null
                },

                location: {
                    city: job.locations_derived?.[0]?.split(",")[0] || null,
                    country: job.countries_derived?.[0] || null,
                    remote: job.remote_derived || false
                },

                employment: {
                    type: job.employment_type?.[0] || null,
                    seniority: job.seniority || null
                },

                description_summary: job.description_text
                    ? job.description_text.slice(0, 200)
                    : null,

                apply_url: job.external_apply_url || job.url || null,

                posted_date: job.date_posted || null
            }));

            // SAVE TO DB
            await prisma.companyJobs.upsert({
                where: { domain },
                update: { jobs_data: { jobs: cleanedJobs, meta: { total_jobs: cleanedJobs.length } } },
                create: { domain, jobs_data: { jobs: cleanedJobs, meta: { total_jobs: cleanedJobs.length } } },
            });

            // 🔥 Step 3: Final response
            return {
                jobs: cleanedJobs,
                meta: {
                    total_jobs: cleanedJobs.length
                }
            };

        } catch (error) {
            console.error("Error in getcompanyjobs:", error);
            throw error;
        }
    }
}

export default new CompanyJobService();