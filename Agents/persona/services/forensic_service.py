import json
from typing import Dict, Any, List, Optional
from persona.services.gemini_service import GeminiService
from persona.services.rag_service import RagService
from persona.common.insights import (
    FORENSIC_INTELLIGENCE_REGISTRY,
    network_collision,
    executive_dominance,
    behavioral_tension,
    adversarial_modeling,
    strategic_verdict
)

class ForensicService:
    def __init__(self):
        self.gemini = GeminiService()
        self.rag = RagService()

    async def generate_theme(
        self, 
        theme_id: str,
        target_name: str, 
        company_name: str, 
        report_id: str,
        compare_report_id: Optional[str] = None,
        comparison_id: Optional[str] = None,
        token: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Executes a single specific deep-dive theme on-demand.
        Supports both single-persona and dual-persona (compare) themes.
        """
        # Find the theme in the registry
        theme = next((t for t in FORENSIC_INTELLIGENCE_REGISTRY if t["id"] == theme_id), None)
        if not theme:
            return {"error": f"Theme '{theme_id}' not found in registry."}

        # Case 1: Comparative Analysis
        if theme.get("type") == "compare" or compare_report_id:
            print(f"[ForensicService] Comparative Analysis: {theme['name']} for {target_name}")
            
            comp_id = comparison_id or f"{report_id}_{compare_report_id}"
            
            if theme_id == "network_collision":
                res = await network_collision(comp_id, report_id, compare_report_id, token=token)
            elif theme_id == "executive_dominance":
                res = await executive_dominance(comp_id, report_id, compare_report_id, token=token)
            elif theme_id == "behavioral_tension":
                res = await behavioral_tension(comp_id, report_id, compare_report_id, token=token)
            elif theme_id == "adversarial_modeling":
                res = await adversarial_modeling(comp_id, report_id, compare_report_id, token=token)
            elif theme_id == "strategic_verdict":
                res = await strategic_verdict(comp_id, report_id, compare_report_id, token=token)
            else:
                return {"error": f"Comparison logic not implemented for theme '{theme_id}'"}
            
            return {"data": res}

        # Case 2: Single Persona Analysis (Existing Logic)
        theme_name = theme["name"]
        queries = theme["queries"]
        prompt_template = theme["prompt"]
        
        print(f"[ForensicService] On-Demand Analysis: {theme_name} for {target_name}")
        
        # 1. Gather Context through Targeted RAG
        all_context_chunks = []
        for q in queries:
            formatted_query = q.format(
                target_name=target_name, 
                company_name=company_name,
                designation="", # Fallback
                industry=""
            )
            
            matches = self.rag.query(formatted_query, top_k=5, namespace=report_id)
            for m in matches:
                chunk = m.get("metadata", {}).get("text") or ""
                if chunk:
                    all_context_chunks.append(chunk)

        combined_context = "\n\n".join(list(set(all_context_chunks))) if all_context_chunks else "Insufficient specific evidence found in research silo."
        
        # 2. Synthesize with Gemini
        input_data = {}
        for key in theme.get("input_keys", []):
            input_data[key] = combined_context
        
        input_data["target_name"] = target_name
        input_data["company_name"] = company_name
        input_data["timestamp"] = ""
        
        try:
            # Handle both {key} and ${key} styles safely without using .format()
            # .format() fails when the template contains literal JSON braces { }
            formatted_prompt = prompt_template
            for k, v in input_data.items():
                # Replace ${key}
                formatted_prompt = formatted_prompt.replace(f"${{{k}}}", str(v))
                # Replace {key} - but be careful not to replace JSON structure
                # We only replace it if it's a standalone key match
                formatted_prompt = formatted_prompt.replace(f"{{{k}}}", str(v))
            
            return await self.gemini.generate_json(formatted_prompt, section_id=f"Forensic_{theme_id}")


        except Exception as e:
            print(f"[ForensicService Error] Failed theme '{theme_id}': {str(e)}")
            return {"error": str(e)}

    async def generate_all(
        self, 
        target_name: str, 
        company_name: str, 
        report_id: str
    ) -> Dict[str, Any]:
        """
        Utility method to run all themes (useful for testing).
        """
        results = {}
        for theme in FORENSIC_INTELLIGENCE_REGISTRY:
            if theme.get("type") == "single":
                results[theme["id"]] = await self.generate_theme(theme["id"], target_name, company_name, report_id)
        return results
