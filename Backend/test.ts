import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

async function testSerperFinancials() {
    const company_name = "Lio";
    const domain = "lio.ai";

    const res = await axios.post(
        "https://google.serper.dev/search",
        { q: `${company_name} ${domain} funding investors revenue employees 2025 2026` },
        {
            headers: {
                "X-API-KEY": process.env.SERPER_API_KEY!,
                "Content-Type": "application/json",
            },
        }
    );

    console.log("Answer Box:", JSON.stringify(res.data?.answerBox, null, 2));
    console.log("Knowledge Graph:", JSON.stringify(res.data?.knowledgeGraph, null, 2));
    console.log("Organic snippets:");
    res.data?.organic?.slice(0, 5).forEach((r: any) => {
        console.log(`- ${r.title}: ${r.snippet}`);
    });
}

testSerperFinancials().catch(console.error);