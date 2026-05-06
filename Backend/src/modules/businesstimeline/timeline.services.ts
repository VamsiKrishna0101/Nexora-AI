import Parallel from "parallel-web";
import prisma from "../../config/prisma";

export interface TimelineEvent {
    year: number;
    event: string;
    type: string;
}

export interface TimelineResult {
    success: boolean;
    data: {
        company: string;
        timeline: TimelineEvent[];
    } | null;
}

function normalizeTimeline(data: any) {
    const allowedTypes = [
        "founding",
        "funding",
        "ipo",
        "acquisition",
        "leadership",
        "expansion",
        "product",
        "milestone",
    ];

    const cleaned = {
        company: data.company,
        timeline: (data.timeline || []).map((item: any) => ({
            year: item.year,
            event: item.event,
            type: allowedTypes.includes(item.type) ? item.type : "milestone",
        })),
    };

    cleaned.timeline.sort((a, b) => a.year - b.year);

    return cleaned;
}

export class TimelineService {
    private client;

    constructor() {
        if (!process.env.PARALLEL_API_KEY) {
            throw new Error("PARALLEL_API_KEY is not set");
        }

        this.client = new Parallel({
            apiKey: process.env.PARALLEL_API_KEY,
        });
    }

    async getCompanyTimeline(input: {
        company_name: string;
        domain: string;
        description?: string;
    }): Promise<TimelineResult> {

        const company_name = input.company_name?.trim();
        const domain = input.domain?.trim().toLowerCase();
        const description = input.description?.trim() ?? "";

        if (!company_name || !domain) {
            throw new Error("company_name and domain are required");
        }

        try {
            // 🔍 cache
            const existing = await prisma.timeline.findUnique({
                where: { domain },
            });

            if (existing) {
                return { success: true, data: existing.timeline_data as any };
            }

            // 🚀 Parallel task
            const taskRun = await this.client.taskRun.create({
                input: { company_name, domain },

                processor: "base-fast",

                task_spec: {
                    input_schema: {
                        type: "json",
                        json_schema: {
                            type: "object",
                            properties: {
                                company_name: { type: "string" },
                                domain: { type: "string" },
                            },
                            required: ["company_name", "domain"],
                        },
                    },

                    output_schema: {
                        type: "json",
                        json_schema: {
                            type: "object",
                            properties: {
                                company: { type: "string" },
                                timeline: {
                                    type: "array",
                                    items: {
                                        type: "object",
                                        properties: {
                                            year: { type: "number" },
                                            event: { type: "string" },
                                            type: { type: "string" },
                                        },
                                        required: ["year", "event", "type"],
                                    },
                                },
                            },
                            required: ["company", "timeline"],
                        },
                    },

                    instructions: `
You are a research analyst. Your job is to extract a DETAILED, SPECIFIC company timeline for "${company_name}" (${domain}).

${description ? `Company description: ${description}` : ""}

STRICT RULES — violating these makes the output useless:

❌ NEVER write vague events. These are REJECTED:
  - "Lio launched"
  - "Series A funding round"
  - "Participated in Y Combinator Batch"
  - "Series A funding round announced"
  - Any event without specifics

✅ ALWAYS write detailed events with real data:
  - "Founded in 2023 as askLio by Vladimir Keil in Prague, Czech Republic"
  - "Raised $30M Series A led by Andreessen Horowitz with participation from Y Combinator"
  - "Joined Y Combinator W24 batch alongside 200+ startups"
  - "Launched AI-powered spreadsheet product to 10,000+ users"

FOR EVERY EVENT YOU MUST INCLUDE (where applicable):
  → Funding: exact amount + lead investor + co-investors
  → Founding: founder names + original company name + location
  → Product: product name + what it does + user/revenue numbers
  → Leadership: full name + role + previous company
  → Acquisition: acquiree name + deal amount + strategic reason
  → Expansion: specific market/country + headcount or revenue milestone

IF YOU DON'T KNOW A SPECIFIC DETAIL:
  → Use web knowledge to infer the most likely specifics
  → Still write a full sentence — never leave it bare

OUTPUT FORMAT (strict JSON only, no markdown, no explanation):
{
  "company": "${company_name}",
  "timeline": [
    {
      "year": 2023,
      "event": "Founded in 2023 as askLio by Vladimir Keil, targeting SMB spreadsheet automation",
      "type": "founding"
    }
  ]
}
`.trim(),
                },
            });

            // ✅ THIS is the correct method (same as your employee service)
            const runResult = await this.client.taskRun.result(taskRun.run_id, {
                timeout: 120,
            });

            const raw = runResult?.output?.content;

            if (!raw) {
                throw new Error("No timeline returned");
            }

            const cleaned = normalizeTimeline(raw);

            // 💾 store
            await prisma.timeline.create({
                data: {
                    domain,
                    timeline_data: cleaned,
                },
            });

            return { success: true, data: cleaned };

        } catch (err) {
            console.error("[TimelineService] Error:", err);
            return { success: false, data: null };
        }
    }
}

export default new TimelineService();