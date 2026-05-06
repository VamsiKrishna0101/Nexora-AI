import axios from "axios";
import prisma from "../../config/prisma";

export interface NewsItem {
    title: string;
    url: string;
    snippet: string;
    source?: string;
    date?: string;
    priority: "high" | "medium" | "low";
}

export interface NewsResult {
    success: boolean;
    data: NewsItem[] | null;
}

const stopWords = new Set([
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to",
    "for", "of", "with", "by", "from", "is", "are", "was", "were",
    "be", "been", "being", "have", "has", "had", "do", "does", "did",
    "will", "would", "could", "should", "may", "might", "shall",
    "this", "that", "these", "those", "it", "its", "they", "them",
    "their", "what", "which", "who", "whom", "how", "when", "where",
    "now", "also", "just", "every", "all", "any", "both", "each",
    "more", "most", "other", "into", "through", "during", "including",
    "known", "formerly", "once", "consumed", "managed", "executed",
    "working", "worldwide", "companies", "purchase", "request", "team",
    "hours", "network", "builds", "world", "first", "advanced"
]);

const extractKeywords = (description: string): string[] => {
    const words = description
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .split(/\s+/)
        .filter(w => w.length > 4 && !stopWords.has(w));

    const freq: Record<string, number> = {};
    words.forEach(w => freq[w] = (freq[w] || 0) + 1);

    return Object.entries(freq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([word]) => `"${word}"`);
};

const assignPriority = (title: string, snippet: string): "high" | "medium" | "low" => {
    const text = (title + " " + snippet).toLowerCase();
    const highKeywords = [
        "acquired", "acquisition", "funding", "raised", "series",
        "lawsuit", "fine", "penalty", "breach", "layoffs", "bankruptcy",
        "merger", "ipo", "investigation", "violation"
    ];
    const medKeywords = [
        "partnership", "product launch", "expansion", "appointed",
        "revenue", "growth", "new feature", "collaboration", "deal",
        "signed", "contract", "hiring", "announced"
    ];
    if (highKeywords.some(k => text.includes(k))) return "high";
    if (medKeywords.some(k => text.includes(k))) return "medium";
    return "low";
};

export class NewsService {

    private async fetchFromSerper(query: string): Promise<any[]> {
        try {
            const res = await axios.post(
                "https://google.serper.dev/news",
                { q: query },
                {
                    headers: {
                        "X-API-KEY": process.env.SERPER_API_KEY!,
                        "Content-Type": "application/json",
                    },
                }
            );
            return res.data.news || [];
        } catch {
            return [];
        }
    }

    private filterRelevant(
        rawNews: any[],
        company_name: string,
        cleanDomain: string
    ): any[] {
        return rawNews.filter((item: any) => {
            const text = (
                item.title + " " +
                item.snippet + " " +
                (item.link || "")
            ).toLowerCase();
            return (
                text.includes(cleanDomain.toLowerCase()) ||
                text.includes(company_name.toLowerCase())
            );
        });
    }

    private deduplicate(news: any[]): any[] {
        const seen = new Set();
        return news.filter((item: any) => {
            if (seen.has(item.link)) return false;
            seen.add(item.link);
            return true;
        });
    }

    private mapToNewsItem(item: any): NewsItem {
        return {
            title: item.title,
            url: item.link,
            snippet: item.snippet,
            source: item.source,
            date: item.date,
            priority: assignPriority(item.title, item.snippet),
        };
    }

    async getCompanyNews(
        company_name: string,
        domain: string,
        description?: string
    ): Promise<NewsResult> {
        try {
            const cleanDomain = domain.replace("www.", "");

            // CACHE CHECK
            const existing = await prisma.newsfeed.findUnique({ where: { domain: cleanDomain } });
            if (existing) {
                return { success: true, data: existing.news_data as any };
            }

            const keywords = description
                ? extractKeywords(description)
                : [];

            const keywordStr = keywords.length > 0
                ? keywords.join(" OR ")
                : "";

            // Query 1 — domain + keywords (most precise)
            const primaryQuery = keywordStr
                ? `"${cleanDomain}" ${keywordStr} news`
                : `"${cleanDomain}" news`;

            // Query 2 — company name + keywords
            const secondaryQuery = keywordStr
                ? `"${company_name}" ${keywordStr} news 2025 OR 2026`
                : `"${company_name}" company news 2025 OR 2026`;

            // Query 3 — bare fallback
            const fallbackQuery = `"${company_name}" latest news`;

            // Fetch primary
            let rawNews = await this.fetchFromSerper(primaryQuery);
            let filtered = this.filterRelevant(rawNews, company_name, cleanDomain);

            // Try secondary if not enough
            if (filtered.length < 3) {
                const secondary = await this.fetchFromSerper(secondaryQuery);
                const secondaryFiltered = this.filterRelevant(
                    secondary, company_name, cleanDomain
                );
                filtered = [...filtered, ...secondaryFiltered];
            }

            // Try bare fallback if still not enough
            if (filtered.length < 3) {
                const fallback = await this.fetchFromSerper(fallbackQuery);
                const fallbackFiltered = this.filterRelevant(
                    fallback, company_name, cleanDomain
                );
                filtered = [...filtered, ...fallbackFiltered];
            }

            // Deduplicate and map
            const unique = this.deduplicate(filtered);

            // Sort by priority — high first
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            const news: NewsItem[] = unique
                .slice(0, 8)
                .map(this.mapToNewsItem)
                .sort((a, b) =>
                    priorityOrder[a.priority] - priorityOrder[b.priority]
                );

            // SAVE TO DB
            await prisma.newsfeed.upsert({
                where: { domain: cleanDomain },
                update: { news_data: news },
                create: { domain: cleanDomain, news_data: news },
            });

            return { success: true, data: news };

        } catch (err) {
            console.error("[NewsService] Error:", err);
            return { success: false, data: null };
        }
    }
}

export default new NewsService();