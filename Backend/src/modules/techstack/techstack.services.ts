import axios from "axios";
import * as cheerio from "cheerio";
import prisma from "../../config/prisma";

export interface TechItem {
    name: string;
    category: string;
    confidence: number;
}

export interface TechStackResult {
    success: boolean;
    data: TechItem[] | null;
}

export class TechStackService {

    async getTechStack(domain: string): Promise<TechStackResult> {
        const url = domain.startsWith("http")
            ? domain
            : `https://${domain}`;
        const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "");

        // CACHE CHECK
        const existing = await prisma.techStack.findUnique({ where: { domain: cleanDomain } });
        if (existing) {
            return { success: true, data: existing.tech_data as any };
        }

        try {
            const res = await axios.get(url, {
                timeout: 10000,
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                },
                maxRedirects: 5,
            });

            const html: string = res.data;
            const headers = res.headers;
            const $ = cheerio.load(html);
            const detected: TechItem[] = [];

            // Collect all script src URLs
            const scriptUrls: string[] = [];
            $("script[src]").each((_, el) => {
                scriptUrls.push($(el).attr("src") || "");
            });

            // Collect all link hrefs
            const linkUrls: string[] = [];
            $("link[href]").each((_, el) => {
                linkUrls.push($(el).attr("href") || "");
            });

            const htmlLower = html.toLowerCase();

            // --- HTTP HEADERS ---
            const server = (headers["server"] || "").toLowerCase();
            const poweredBy = (headers["x-powered-by"] || "").toLowerCase();

            if (server.includes("nginx")) detected.push({ name: "Nginx", category: "Web servers", confidence: 100 });
            if (server.includes("apache")) detected.push({ name: "Apache", category: "Web servers", confidence: 100 });
            if (server.includes("cloudflare")) detected.push({ name: "Cloudflare", category: "CDN", confidence: 100 });
            if (server.includes("gunicorn")) detected.push({ name: "Python/Gunicorn", category: "Web servers", confidence: 100 });
            if (server.includes("caddy")) detected.push({ name: "Caddy", category: "Web servers", confidence: 100 });
            if (poweredBy.includes("express")) detected.push({ name: "Express.js / Node.js", category: "Web frameworks", confidence: 100 });
            if (poweredBy.includes("php")) detected.push({ name: "PHP", category: "Programming languages", confidence: 100 });
            if (poweredBy.includes("asp.net")) detected.push({ name: "ASP.NET", category: "Web frameworks", confidence: 100 });
            if (headers["cf-ray"]) detected.push({ name: "Cloudflare", category: "CDN", confidence: 100 });
            if (headers["x-vercel-id"]) detected.push({ name: "Vercel", category: "Cloud hosting", confidence: 100 });
            if (headers["x-amz-cf-id"]) detected.push({ name: "AWS CloudFront", category: "CDN", confidence: 100 });
            if (headers["x-netlify"]) detected.push({ name: "Netlify", category: "Cloud hosting", confidence: 100 });
            if (headers["x-github-request-id"]) detected.push({ name: "GitHub Pages", category: "Cloud hosting", confidence: 100 });

            // --- HTML PATTERNS ---
            if (htmlLower.includes("wp-content") || htmlLower.includes("wp-includes")) detected.push({ name: "WordPress", category: "CMS", confidence: 95 });
            if (htmlLower.includes("cdn.shopify.com")) detected.push({ name: "Shopify", category: "Ecommerce", confidence: 100 });
            if (htmlLower.includes("x-data=") || htmlLower.includes("alpine.js")) detected.push({ name: "Alpine.js", category: "JavaScript frameworks", confidence: 90 });
            if (htmlLower.includes("tailwindcss") || htmlLower.includes("tailwind")) detected.push({ name: "Tailwind CSS", category: "UI Frameworks", confidence: 85 });
            if (htmlLower.includes('"next_data"') || htmlLower.includes("__next_data__") || htmlLower.includes("_next/static")) detected.push({ name: "Next.js", category: "JavaScript frameworks", confidence: 100 });
            if (htmlLower.includes("nuxt") || htmlLower.includes("__nuxt")) detected.push({ name: "Nuxt.js", category: "JavaScript frameworks", confidence: 95 });
            if (htmlLower.includes("ng-version") || htmlLower.includes("ng-app")) detected.push({ name: "Angular", category: "JavaScript frameworks", confidence: 95 });
            if (htmlLower.includes("data-reactroot") || htmlLower.includes("data-reactid")) detected.push({ name: "React", category: "JavaScript frameworks", confidence: 95 });
            if (htmlLower.includes("fonts.googleapis.com")) detected.push({ name: "Google Fonts", category: "Font Scripts", confidence: 100 });
            if (htmlLower.includes("typeform.com")) detected.push({ name: "Typeform", category: "Forms", confidence: 100 });
            if (htmlLower.includes("calendly.com")) detected.push({ name: "Calendly", category: "Scheduling", confidence: 100 });
            if (htmlLower.includes("stripe.com/v3") || htmlLower.includes("js.stripe.com")) detected.push({ name: "Stripe", category: "Payments", confidence: 100 });
            if (htmlLower.includes("recaptcha")) detected.push({ name: "reCAPTCHA", category: "Security", confidence: 100 });
            if (htmlLower.includes("bootstrap")) detected.push({ name: "Bootstrap", category: "UI Frameworks", confidence: 85 });
            if (htmlLower.includes("webflow")) detected.push({ name: "Webflow", category: "CMS", confidence: 95 });
            if (htmlLower.includes("framer")) detected.push({ name: "Framer", category: "CMS", confidence: 90 });
            if (htmlLower.includes("ghost.io") || htmlLower.includes("ghost-url")) detected.push({ name: "Ghost", category: "CMS", confidence: 95 });

            // --- SCRIPT URLS ---
            for (const src of scriptUrls) {
                const s = src.toLowerCase();
                if (s.includes("google-analytics.com") || s.includes("gtag/js")) detected.push({ name: "Google Analytics", category: "Analytics", confidence: 100 });
                if (s.includes("googletagmanager.com")) detected.push({ name: "Google Tag Manager", category: "Tag Managers", confidence: 100 });
                if (s.includes("hotjar.com")) detected.push({ name: "Hotjar", category: "Analytics", confidence: 100 });
                if (s.includes("intercom.io") || s.includes("intercomcdn")) detected.push({ name: "Intercom", category: "Customer Support", confidence: 100 });
                if (s.includes("hubspot.com") || s.includes("hs-scripts")) detected.push({ name: "HubSpot", category: "Marketing", confidence: 100 });
                if (s.includes("segment.com") || s.includes("segment.io")) detected.push({ name: "Segment", category: "Analytics", confidence: 100 });
                if (s.includes("mixpanel.com")) detected.push({ name: "Mixpanel", category: "Analytics", confidence: 100 });
                if (s.includes("sentry.io") || s.includes("sentry-cdn")) detected.push({ name: "Sentry", category: "Error Tracking", confidence: 100 });
                if (s.includes("crisp.chat")) detected.push({ name: "Crisp", category: "Customer Support", confidence: 100 });
                if (s.includes("zendesk.com")) detected.push({ name: "Zendesk", category: "Customer Support", confidence: 100 });
                if (s.includes("stripe.com")) detected.push({ name: "Stripe", category: "Payments", confidence: 100 });
                if (s.includes("linkedin.com/analytics") || s.includes("snap.licdn")) detected.push({ name: "LinkedIn Insight", category: "Advertising", confidence: 100 });
                if (s.includes("facebook.net") || s.includes("fbevents")) detected.push({ name: "Facebook Pixel", category: "Advertising", confidence: 100 });
                if (s.includes("clarity.ms")) detected.push({ name: "Microsoft Clarity", category: "Analytics", confidence: 100 });
                if (s.includes("posthog.com")) detected.push({ name: "PostHog", category: "Analytics", confidence: 100 });
                if (s.includes("plausible.io")) detected.push({ name: "Plausible", category: "Analytics", confidence: 100 });
                if (s.includes("amplitude.com")) detected.push({ name: "Amplitude", category: "Analytics", confidence: 100 });
                if (s.includes("heap.io")) detected.push({ name: "Heap", category: "Analytics", confidence: 100 });
                if (s.includes("churnzero.net")) detected.push({ name: "ChurnZero", category: "Customer Success", confidence: 100 });
                if (s.includes("pendo.io")) detected.push({ name: "Pendo", category: "Product Analytics", confidence: 100 });
                if (s.includes("fullstory.com")) detected.push({ name: "FullStory", category: "Analytics", confidence: 100 });
                if (s.includes("tawk.to")) detected.push({ name: "Tawk.to", category: "Customer Support", confidence: 100 });
                if (s.includes("drift.com")) detected.push({ name: "Drift", category: "Customer Support", confidence: 100 });
                if (s.includes("vue.js") || s.includes("vuejs.org")) detected.push({ name: "Vue.js", category: "JavaScript frameworks", confidence: 95 });
                if (s.includes("react.js") || s.includes("react.development") || s.includes("react.production")) detected.push({ name: "React", category: "JavaScript frameworks", confidence: 95 });
            }

            // Deduplicate by name
            const seen = new Set<string>();
            const unique = detected.filter(item => {
                if (seen.has(item.name)) return false;
                seen.add(item.name);
                return true;
            });

            unique.sort((a, b) => b.confidence - a.confidence);

            // SAVE TO DB
            await prisma.techStack.upsert({
                where: { domain: cleanDomain },
                update: { tech_data: unique },
                create: { domain: cleanDomain, tech_data: unique },
            });

            return { success: true, data: unique };

        } catch (err: any) {
            console.error("[TechStackService] Error:", err.message);
            return { success: false, data: null };
        }
    }
}

export default new TechStackService();