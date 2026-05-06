import asyncio
from typing import Dict, Any, List
from persona.services.gemini_service import GeminiService
from persona.services.rag_service import RagService
from src.services.backend_client import BackendClient
from persona.compare.context_extractor import extract_comparison_context
from src.state import AppCompareState
from persona.prompts.prompt import (
    COMPARE_SNAPSHOT_PROMPT,
    COMPARE_CAREER_PROMPT,
    COMPARE_SKILLS_PROMPT,
    COMPARE_BEHAVIOR_PROMPT,
    COMPARE_INFLUENCE_PROMPT,
    COMPARE_ENGAGEMENT_PROMPT,
    COMPARE_RISK_PROMPT,
    COMPARE_VERDICT_PROMPT
)

class ComparisonNodes:
    def __init__(self):
        self.gemini = GeminiService()
        self.backend = BackendClient()
        self.rag = RagService()

    async def fetch_reports_node(self, state: AppCompareState) -> Dict[str, Any]:
        """
        Fetches the two large persona JSONs from the DB and prunes them for the LLM.
        """
        print(f"\n[DEBUG] [fetch_reports_node] START")
        print(f"[DEBUG] [fetch_reports_node] IDs: {state.report1_id} / {state.report2_id}")
        
        # Use the real token from the state passed from the API endpoint
        token = state.token
        if not token:
            print("[DEBUG] [fetch_reports_node] ERROR: No token in state!")
        
        print(f"[DEBUG] [fetch_reports_node] Fetching report 1...")
        persona1_obj = self.backend.get_report(state.report1_id, token)
        print(f"[DEBUG] [fetch_reports_node] Fetching report 2...")
        persona2_obj = self.backend.get_report(state.report2_id, token)
        
        # Ensure we have dictionaries before calling .get()
        persona1 = persona1_obj.get("report_data") if (persona1_obj and isinstance(persona1_obj, dict)) else None
        persona2 = persona2_obj.get("report_data") if (persona2_obj and isinstance(persona2_obj, dict)) else None
        
        if not persona1 or not persona2:
            msg = f"Missing data. P1: {True if persona1 else False}, P2: {True if persona2 else False}"
            print(f"[DEBUG] [fetch_reports_node] ERROR: {msg}")
            return {"errors": [f"Could not fetch one or both persona reports from the backend: {msg}"]}
            
        print("[DEBUG] [fetch_reports_node] Reports found. Extracting context...")
        ctx1 = extract_comparison_context(persona1)
        ctx2 = extract_comparison_context(persona2)
        print(f"[DEBUG] [fetch_reports_node] SUCCESS. Contexts ready for {ctx1.get('name')} and {ctx2.get('name')}")
        
        return {
            "persona1_ctx": ctx1,
            "persona2_ctx": ctx2
        }

    async def intelligence_node(self, state: AppCompareState) -> Dict[str, Any]:
        """
        Runs the first 7 comparison sections in parallel.
        """
        if not state.persona1_ctx or not state.persona2_ctx:
            print("[DEBUG] [intelligence_node] ERROR: Missing contexts. Aborting.")
            return {"errors": ["Missing persona contexts in state."]}
            
        name_a = state.persona1_ctx["name"]
        name_b = state.persona2_ctx["name"]
        
        print(f"[DEBUG] [intelligence_node] START. Analyzing {name_a} vs {name_b}...")

        tasks = [
            self._run_section(COMPARE_SNAPSHOT_PROMPT, {"name_a": name_a, "name_b": name_b, "person_a_context": state.persona1_ctx, "person_b_context": state.persona2_ctx}, "snapshot"),
            self._run_section(COMPARE_CAREER_PROMPT, {"name_a": name_a, "name_b": name_b, "person_a_career": state.persona1_ctx, "person_b_career": state.persona2_ctx}, "career"),
            self._run_section(COMPARE_SKILLS_PROMPT, {"name_a": name_a, "name_b": name_b, "person_a_skills": state.persona1_ctx, "person_b_skills": state.persona2_ctx}, "skills"),
            self._run_section(COMPARE_BEHAVIOR_PROMPT, {"name_a": name_a, "name_b": name_b, "person_a_behavior": state.persona1_ctx, "person_b_behavior": state.persona2_ctx}, "behavior"),
            self._run_section(COMPARE_INFLUENCE_PROMPT, {"name_a": name_a, "name_b": name_b, "person_a_presence": state.persona1_ctx, "person_b_presence": state.persona2_ctx}, "influence"),
            self._run_section(COMPARE_ENGAGEMENT_PROMPT, {"name_a": name_a, "name_b": name_b, "person_a_engagement": state.persona1_ctx, "person_b_engagement": state.persona2_ctx}, "engagement"),
            self._run_section(COMPARE_RISK_PROMPT, {"name_a": name_a, "name_b": name_b, "person_a_risk": state.persona1_ctx, "person_b_risk": state.persona2_ctx}, "risk")
        ]
        
        print(f"[DEBUG] [intelligence_node] Launching {len(tasks)} parallel Gemini tasks...")
        results = await asyncio.gather(*tasks)
        print(f"[DEBUG] [intelligence_node] Parallel tasks finished. Status: {[list(r.keys())[0] for r in results]}")
        
        update = {}
        for res in results:
            update.update(res)
            
        return update

    async def verdict_node(self, state: AppCompareState) -> Dict[str, Any]:
        """
        Final synthesis node.
        """
        if not state.persona1_ctx or not state.persona2_ctx:
            print("[DEBUG] [verdict_node] ERROR: Missing contexts. Aborting.")
            return {"errors": ["Cannot generate verdict: missing persona contexts."]}
            
        name_a = state.persona1_ctx["name"]
        name_b = state.persona2_ctx["name"]
        
        print(f"[DEBUG] [verdict_node] START. Generating Master Verdict for {name_a} vs {name_b}...")
        
        # Prepare comparison context from previous steps
        comparison_results = {
            "snapshot": state.snapshot,
            "career": state.career,
            "skills": state.skills,
            "behavior": state.behavior,
            "influence": state.influence,
            "engagement": state.engagement,
            "risk": state.risk
        }
        
        try:
            prompt = COMPARE_VERDICT_PROMPT.format(
                name_a=name_a,
                name_b=name_b,
                person_a_verdict=state.persona1_ctx,
                person_b_verdict=state.persona2_ctx,
                overall_comparison_results=comparison_results
            )
            res = await self.gemini.generate_json(prompt, section_id="compare_verdict")
            print("[DEBUG] [verdict_node] SUCCESS. Verdict generated.")
            return {"verdict": res}
        except Exception as e:
            print(f"[DEBUG] [verdict_node] ERROR: {e}")
            return {"verdict": None, "errors": [f"Verdict node failed: {e}"]}

    async def storage_node(self, state: AppCompareState) -> Dict[str, Any]:
        """
        Persists to DB and silos in RAG.
        """
        print(f"\n[DEBUG] [storage_node] START")
        print(f"[DEBUG] [storage_node] Saving to DB for {state.report1_id} + {state.report2_id}")
        
        # 1. DB Persistence
        comparison_payload = {
            "snapshot": state.snapshot,
            "career": state.career,
            "skills": state.skills,
            "behavior": state.behavior,
            "influence": state.influence,
            "engagement": state.engagement,
            "risk": state.risk,
            "verdict": state.verdict
        }
        
        # Use the real token from the state
        token = state.token
        if not token:
            print("[DEBUG] [storage_node] ERROR: No token for storage!")
        
        comp_obj = self.backend.save_comparison(
            report1_id=state.report1_id,
            report2_id=state.report2_id,
            comparison_data=comparison_payload,
            token=token
        )
        
        print(f"[DEBUG] [storage_node] DB Call finished. Result: {'Success' if comp_obj else 'Failed'}")
        
        # 2. RAG Indexing (Unique Namespace)
        try:
            namespace = f"{state.report1_id}_{state.report2_id}"
            print(f"[DEBUG] [storage_node] Indexing in RAG (Namespace: {namespace})...")
            self.rag.index_comparison_data(
                persona_a_name=state.persona1_ctx["name"],
                persona_b_name=state.persona2_ctx["name"],
                comparison_sections=comparison_payload,
                namespace=namespace
            )
            print("[DEBUG] [storage_node] RAG Indexing finished. SUCCESS.")
            return {"comparison_id": comp_obj.get("id") if comp_obj else None, "rag_indexed": True}
        except Exception as e:
            print(f"[DEBUG] [storage_node] RAG ERROR: {e}")
            return {"errors": [f"Storage node failed: {e}"]}

    async def _run_section(self, prompt_template: str, inputs: Dict[str, Any], section_key: str) -> Dict[str, Any]:
        """Helper to run Gemini for a specific section."""
        try:
            prompt = prompt_template.format(**inputs)
            res = await self.gemini.generate_json(prompt, section_id=f"compare_{section_key}")
            return {section_key: res}
        except Exception as e:
            return {section_key: None, "errors": [f"Section {section_key} failed: {e}"]}
