import axios from "axios";
import Groq from "groq-sdk";
import Parallel from "parallel-web";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

const parallel = new Parallel({
    apiKey: process.env.PARALLEL_API_KEY!,
});

export interface FundingRound {
    type: string;
    amount: string;
    date: string;
    investors: string[];
}

export interface FinancialsData {
    total_funding: string;
    funding_stage: string;
    last_funding_date: string;
    funding_rounds: FundingRound[];
    investors: string[];
    estimated_revenue: string;
    employee_count: string;
    valuation: string;
    financial_health: string;
    data_source: string;
}

export interface FinancialsResult {
    success: boolean;
    data: FinancialsData | null;
}

class FinanceService {

    // 🔍 SERPER SEARCH
    private async searchSerper(query: string): Promise<string> {
        try {
            const res = await axios.post(
                "https://google.serper.dev/search",
                { q: query },
                {
                    headers: {
                        "X-API-KEY": process.env.SERPER_API_KEY!,
                        "Content-Type": "application/json",
                    },
                    timeout: 8000,
                }
            );

            const answerBox = res.data?.answerBox?.snippet || "";
            const knowledgeGraph = res.data?.knowledgeGraph?.description || "";

            const snippets = (res.data?.organic || [])
                .slice(0, 5)
                .map((r: any) => `${r.title}: ${r.snippet}`)
                .join("\n");

            return [answerBox, knowledgeGraph, snippets]
                .filter(Boolean)
                .join("\n");

        } catch {
            return "";
        }
    }

    // ⚡ PARALLEL WEB AGENT (NO SCRAPING)
    private async getParallelInsights(company_name: string, domain: string): Promise<string> {
        try {
            const taskRun = await parallel.taskRun.create({
                input: `Extract financial details including funding, investors, revenue, and employee count.

Company: ${company_name}
Domain: ${domain}`,
                task_spec: {
                    output_schema: {
                        type: "json",
                        json_schema: {
                            type: "object",
                            properties: {
                                funding_summary: { type: "string" },
                                investors: { type: "string" },
                                revenue: { type: "string" },
                                employees: { type: "string" }
                            },
                            required: ["funding_summary", "investors", "revenue", "employees"],
                            additionalProperties: false
                        }
                    }
                },
                processor: "base",
            });

            // simple polling (basic MVP)
            let result = null;
            for (let i = 0; i < 10; i++) {
                const run = await parallel.taskRun.get(taskRun.run_id);
                if (run.status === "completed") {
                    result = run.output;
                    break;
                }
                await new Promise(r => setTimeout(r, 1500));
            }

            return result ? JSON.stringify(result) : "";

        } catch {
            return "";
        }
    }

    // 🚀 MAIN FUNCTION
    async getFinancials(
        domain: string,
        company_name: string,
        description?: string
    ): Promise<FinancialsResult> {
        try {

            // ⚡ PARALLEL EXECUTION
            const [generalContext, fundingContext, parallelContext] = await Promise.all([
                this.searchSerper(
                    `${company_name} ${domain} funding investors revenue employees 2025 2026`
                ),
                this.searchSerper(
                    `"${company_name}" funding round investors valuation`
                ),
                this.getParallelInsights(company_name, domain)
            ]);

            const fullContext = [
                generalContext,
                fundingContext,
                parallelContext
            ]
                .filter(Boolean)
                .join("\n\n---\n\n");

            console.log("[FinancialsService] Context length:", fullContext.length);

            if (!fullContext.trim()) {
                return { success: false, data: null };
            }

            // 🧠 LLM EXTRACTION
            const prompt = `You are a senior venture capital analyst and financial intelligence system.

Your task is NOT just to extract data, but to infer, validate, and structure company financial intelligence from incomplete and noisy information.

STRICT INSTRUCTIONS:
- Use ONLY the provided context
- If exact values are missing, infer realistic ranges based on industry standards
- Do NOT hallucinate precise numbers — prefer ranges when uncertain
- Cross-validate signals (funding mentions, hiring signals, scale indicators)
- Prioritize accuracy over completeness

ANALYSIS OBJECTIVES:
1. Identify funding signals (rounds, investors, capital raised)
2. Infer company maturity stage (Seed, Series A, Growth, etc.)
3. Estimate revenue range based on:
   - funding size
   - employee scale
   - product type (B2B SaaS vs others)
4. Estimate employee count if not explicitly mentioned
5. Infer valuation heuristically (use funding + stage patterns)
6. Assess financial health:
   - "Strong Growth"
   - "Moderate Growth"
   - "Early Stage"
   - "Uncertain"
   - "Declining"

7. Detect inconsistencies or weak signals:
   - missing funding data
   - vague claims
   - no investor mentions

Company:
${company_name}
Domain:
${domain}

Description:
${description || "Not provided"}

Context:
${fullContext.slice(0, 4000)}

Return ONLY valid JSON (no explanation):

{
  "total_funding": "",
  "funding_stage": "",
  "last_funding_date": "",
  "funding_rounds": [
    {
      "type": "",
      "amount": "",
      "date": "",
      "investors": []
    }
  ],
  "investors": [],
  "estimated_revenue": "",
  "employee_count": "",
  "valuation": "",
  "financial_health": "",
  "confidence_score": 0,
  "key_signals": [],
  "risks": [],
  "data_source": "serper_parallel_ai"
}`;
            const aiRes = await groq.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.1,
                max_tokens: 1000,
            });

            const content = aiRes.choices[0].message.content || "{}";
            const clean = content.replace(/```json/g, "").replace(/```/g, "").trim();

            const data: FinancialsData = JSON.parse(clean);

            return { success: true, data };

        } catch (err: any) {
            console.error("[FinancialsService] Error:", err.message);
            return { success: false, data: null };
        }
    }
}

export default new FinanceService();