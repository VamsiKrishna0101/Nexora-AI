import axios from 'axios'
import dotenv from 'dotenv'
import prisma from '../../config/prisma';

dotenv.config()


class CompanyServices {
    async getDomainofCompany(name: string) {
        // 1. Search Local Domain matches (Fuzzy)
        const localDomains = await prisma.domain.findMany({
            where: {
                OR: [
                    { company_name: { contains: name, mode: 'insensitive' } },
                    { domain: { contains: name, mode: 'insensitive' } }
                ]
            },
            take: 5
        });

        // 2. Search SavedCompanies (Fuzzy) - as they might have better name/domain mapping
        const savedCompanies = await prisma.savedCompany.findMany({
            where: {
                company_name: {
                    contains: name,
                    mode: 'insensitive'
                }
            },
            distinct: ['domain'],
            take: 5
        });

        // Combine and deduplicate
        const suggestions = new Map<string, { name: string, domain: string, logo_url?: string }>();
        
        localDomains.forEach(d => {
            suggestions.set(d.domain, { name: d.company_name, domain: d.domain });
        });

        savedCompanies.forEach(c => {
            if (!suggestions.has(c.domain)) {
                suggestions.set(c.domain, { name: c.company_name, domain: c.domain, logo_url: c.logo_url || undefined });
            }
        });

        // 3. Fallback to External API (if local results are low)
        if (suggestions.size < 3) {
            try {
                const res = await axios.get(
                    `https://autocomplete.clearbit.com/v1/companies/suggest?query=${encodeURIComponent(name)}`
                );
                
                res.data.forEach((item: any) => {
                    if (!suggestions.has(item.domain)) {
                        suggestions.set(item.domain, { 
                            name: item.name, 
                            domain: item.domain, 
                            logo_url: item.logo 
                        });
                    }
                });
            } catch (err) {
                console.error("[getDomainofCompany] External fallback failed:", err);
            }
        }

        // Convert Map to Array and take top 8
        return Array.from(suggestions.values()).slice(0, 8);
    }

    async getCompanyInfo(domain: string) {
        try {

            // 🔗 get domain record first (upsert if missing)
            const domainRecord = await prisma.domain.upsert({
                where: { domain: domain },
                update: {},
                create: {
                    domain: domain,
                    company_name: domain.split('.')[0] // fallback name
                }
            });


            const existingcompany = await prisma.company.findUnique({
                where: {
                    domain_id: domainRecord.id
                }
            })

            // ❌ fixed typo here
            if (existingcompany) {
                return existingcompany.company_data
            }

            const res = await axios.get(
                `https://api.companyenrich.com/companies/enrich`,
                {
                    headers: {
                        Authorization: `Bearer ${process.env.COMPANYENRICH_API_KEY?.trim()}`,
                    },
                    params: {
                        domain: domain,
                    },
                }
            );

            await prisma.company.upsert({
                where: { domain_id: domainRecord.id },
                update: {
                    company_data: res.data
                },
                create: {
                    domain_id: domainRecord.id,
                    company_data: res.data
                }
            })


            return res.data;

        } catch (err: any) {
            console.error(err.response?.data || err.message);
            throw new Error("Company enrichment failed");
        }
    }
}

export default new CompanyServices();