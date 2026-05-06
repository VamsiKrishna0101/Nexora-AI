import asyncio
import json
from typing import Dict, Any, List
from persona.services.rag_service import RagService
from src.services.gemini_service import GeminiService
from src.prompts.companyragquery import RAG_QUERIES
from src.prompts import templates

class CompanyAnalysisService:
    def __init__(self):
        self.rag_service = RagService()
        self.gemini = GeminiService()

    async def generate_ai_highlights(self, namespace: str) -> Dict[str, Any]:
        """
        Generates the 6 deep-dive RAG-driven verdict sections for a company.
        """
        print(f"[CompanyAnalysisService] Starting RAG-driven analysis for namespace: {namespace}")
        
        # We'll run all 6 sections in parallel
        categories = [
            "CAPITAL_EFFICIENCY",
            "COMPETITIVE_MOAT",
            "LEADERSHIP_RISK",
            "MARKET_TIMING",
            "STRATEGIC_SIGNALS",
            "EXIT_VALUATION"
        ]
        
        tasks = [self._generate_single_category(cat, namespace) for cat in categories]
        results = await asyncio.gather(*tasks)
        
        # Combine results into a single dictionary
        highlights = {}
        for cat, res in zip(categories, results):
            highlights[cat.lower()] = res
            
        return highlights

    async def _generate_single_category(self, category: str, namespace: str) -> Dict[str, Any]:
        """
        Performs RAG retrieval and LLM generation for a single verdict category.
        """
        try:
            # 1. Prepare Queries
            query_strings = RAG_QUERIES.get(category, [])
            if not query_strings:
                return {"error": f"No queries found for category: {category}"}
            
            # 2. Sequential RAG Retrieval (Parallelized via query_batch)
            # We want to fetch a good amount of context for each category
            queries = [{"query": q, "top_k": 5, "namespace": namespace} for q in query_strings]
            
            print(f"[CompanyAnalysisService] [{category}] Performing RAG retrieval...")
            matches = await self.rag_service.query_batch(queries)
            
            if not matches:
                print(f"[CompanyAnalysisService] [{category}] No RAG context found.")
                return {"error": "No relevant context found in RAG index."}

            # 3. Deduplicate and format context
            seen_texts = set()
            context_pieces = []
            for m in matches:
                txt = m.get("text", "").strip()
                if txt and txt not in seen_texts:
                    seen_texts.add(txt)
                    context_pieces.append(txt)
            
            full_context = "\n\n---\n\n".join(context_pieces)
            
            # 4. Get Prompt Template
            template = getattr(templates, category, None)
            if not template:
                return {"error": f"Template for {category} not found in prompts.templates"}
            
            # The user used ${data} in prompts, we replace it with our context
            prompt = template.replace("${data}", full_context)
            
            # 5. Generate with Gemini
            print(f"[CompanyAnalysisService] [{category}] Generating verdict via Gemini...")
            result = await self.gemini.generate_json(
                prompt=prompt,
                section_id=f"rag_{category.lower()}",
                system_instruction="You are a senior investment analyst. Use the provided context to fill out the JSON exactly. Never fabricate data."
            )
            
            return result

        except Exception as e:
            print(f"[CompanyAnalysisService] Error in {category}: {str(e)}")
            return {"error": str(e)}

if __name__ == "__main__":
    # Test stub
    service = CompanyAnalysisService()
    # async asyncio.run(service.generate_ai_highlights("test_namespace"))
