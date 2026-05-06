import asyncio
import os
import json
from dotenv import load_dotenv
from src.graph import agent_graph

# Load environment variables
load_dotenv()

async def test_full_report():
    # The full Lio JSON data provided by the user
    json_data = """
    {
      "id": "019cc352-0164-7f55-b582-a6801ddc6eb4",
      "name": "Lio",
      "domain": "lio.ai",
      "website": "https://lio.ai",
      "type": null,
      "industry": "Software",
      "industries": [
        "Software",
        "Business Services/Custom Software & IT Services",
        "Media & Internet/Data Collection & Internet Portals"
      ],
      "categories": [
        "b2b",
        "saas"
      ],
      "employees": null,
      "revenue": null,
      "description": "Lio is an enterprise-focused procurement technology company offering an AI-powered, multi-agent workforce that handles purchase requests in parallel. Their system researches vendors, negotiates terms, secures approvals, and tracks deliveries to streamline procurement workflows for global enterprises. With offices in New York City and Munich, Lio emphasizes integration with existing P2P and ERP systems and aims to reduce manual workload while increasing savings and compliance across large organizations.",
      "keywords": [
        "agent-based procurement",
        "multi-agent procurement",
        "vendor research",
        "contract negotiation",
        "spend optimization",
        "p2p integration",
        "erp integration",
        "enterprise procurement",
        "operational automation",
        "tail spend reduction",
        "procurement workflow automation",
        "supplier onboarding",
        "procurement intelligence",
        "invoice processing",
        "approval management",
        "goods received workflow",
        "compliance governance",
        "procurement analytics",
        "enterprise security",
        "procurement automation",
        "supplier research",
        "approval workflows",
        "order orchestration",
        "compliance",
        "procurement software"
      ],
      "technologies": [],
      "subsidiaries": null,
      "founded_year": 2023,
      "naics_codes": [
        "511210",
        "541511",
        "518210",
        "541512",
        "541519"
      ],
      "location": {
        "country": {
          "code": "US",
          "name": "United States",
          "latitude": 38,
          "longitude": -97
        },
        "state": {
          "id": 4880,
          "name": "New York",
          "code": "NY",
          "latitude": 40.712776,
          "longitude": -74.005974
        },
        "address": "524 Broadway, New York, NY 10012, United States",
        "phone": "+1 (646) 776-4657"
      },
      "financial": {
        "stock_symbol": null,
        "stock_exchange": null,
        "total_funding": 5000000,
        "funding_stage": "Seed",
        "funding_date": "2024-01-01",
        "funding": [
          {
            "round": "Seed",
            "amount": 5000000,
            "investors": ["Founders Fund", "Index Ventures"]
          }
        ]
      },
      "socials": {
        "linkedin_url": "https://www.linkedin.com/company/lio-ai",
        "twitter_url": "https://twitter.com/lio_ai"
      },
      "products": [
        {"name": "Lio Autonomous Procurement", "description": "AI workforce for multi-agent procurement tasks."},
        {"name": "Lio Vendor Intelligence", "description": "Real-time vendor data and risk assessment."}
      ],
      "competitors": [
        {"name": "Omnea", "domain": "omnea.com", "description": "Procurement orchestration and automation."},
        {"name": "Zip", "domain": "ziphq.com", "description": "Intake-to-procure solution for spend visibility."}
      ],
      "linkedin_posts": [
        {"text": "We are proud to announce our $5M Seed round to transform procurement...", "likes": 450, "comments": 34, "author": "CEO Name"},
        {"text": "Why multi-agent systems are the future of enterprise operations...", "likes": 210, "comments": 12, "author": "CTO Name"}
      ],
      "company_jobs": [
        {"title": "Software Engineer (AI/LLM)", "department": "Engineering"},
        {"title": "Account Executive", "department": "Sales"}
      ],
      "newsfeed": [
        {"headline": "Lio Raises $5M to Bring AI to Procurement Automation"},
        {"headline": "How Lio is Reimagining the Corporate Supply Chain"}
      ],
      "businesstimeline": [
        {"event": "Founded in New York", "date": "2023-01-01"},
        {"event": "Alpha launch with F500 clients", "date": "2023-09-15"},
        {"event": "Closed $5M Seed Round", "date": "2024-01-01"}
      ],
      "techstack": ["Next.js", "Python", "FastAPI", "PostgreSQL", "LangChain", "OpenAI"]
    }
    """
    
    # Parse JSON
    raw_data = json.loads(json_data)

    print(f"--- Starting Full 12-Section Corporate Intelligence Report for {raw_data['name']} ---")
    
    try:
        # Initial state
        initial_state = {
            "raw_data": raw_data,
            "section_01": "",
            "section_02": "",
            "section_03": "",
            "section_04": "",
            "section_05": "",
            "section_06": "",
            "section_07": "",
            "section_08": "",
            "section_09": "",
            "section_10": "",
            "section_11": "",
            "section_12": "",
            "errors": []
        }
        
        # Invoke the graph
        result = await agent_graph.ainvoke(initial_state)
        
        if result.get("errors"):
            print("\n!!! ERRORS ENCOUNTERED !!!")
            for error in result["errors"]:
                print(f"- {error}")
        else:
            print("\n--- CORPORATE INTELLIGENCE REPORT ---")
            
            # Print and Save to file
            report_lines = ["# CORPORATE INTELLIGENCE REPORT: LIO\n"]
            
            sections = [
                "section_01", "section_02", "section_03", "section_04", "section_05",
                "section_06", "section_07", "section_08", "section_09", "section_10",
                "section_11", "section_12"
            ]
            
            for section in sections:
                content = result.get(section, "")
                print(f"\n{content}")
                report_lines.append(content)
            
            # Save to file
            with open("lio_intelligence_report.md", "w", encoding="utf-8") as f:
                f.write("\n\n".join(report_lines))
            
            print(f"\n--- REPORT SAVED TO: lio_intelligence_report.md ---")
            print("\n--- END OF FULL REPORT ---")

    except Exception as e:
        print(f"An unexpected error occurred: {e}")

if __name__ == "__main__":
    asyncio.run(test_full_report())
