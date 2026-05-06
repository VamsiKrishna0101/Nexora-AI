from typing import Dict, Any, List
import asyncio
from persona.services.gemini_service import GeminiService
from persona.compare.context_extractor import extract_comparison_context
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

class ComparisonService:
    """
    Elite orchestrator for Palantir-level comparative intelligence.
    Runs 8 specialized sections to compare two personas.
    """
    def __init__(self):
        self.gemini = GeminiService()

    async def compare(self, persona_a: Dict[str, Any], persona_b: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes the full 8-section comparison suite.
        """
        # 1. Distill contexts to minimize tokens and focus synthesis
        ctx_a = extract_comparison_context(persona_a)
        ctx_b = extract_comparison_context(persona_b)
        
        name_a = ctx_a["name"]
        name_b = ctx_b["name"]

        # 2. Run initial 7 sections in parallel for speed
        tasks = [
            self._run_section(COMPARE_SNAPSHOT_PROMPT, {"name_a": name_a, "name_b": name_b, "person_a_context": ctx_a, "person_b_context": ctx_b}, "snapshot"),
            self._run_section(COMPARE_CAREER_PROMPT, {"name_a": name_a, "name_b": name_b, "person_a_career": ctx_a, "person_b_career": ctx_b}, "career"),
            self._run_section(COMPARE_SKILLS_PROMPT, {"name_a": name_a, "name_b": name_b, "person_a_skills": ctx_a, "person_b_skills": ctx_b}, "skills"),
            self._run_section(COMPARE_BEHAVIOR_PROMPT, {"name_a": name_a, "name_b": name_b, "person_a_behavior": ctx_a, "person_b_behavior": ctx_b}, "behavior"),
            self._run_section(COMPARE_INFLUENCE_PROMPT, {"name_a": name_a, "name_b": name_b, "person_a_presence": ctx_a, "person_b_presence": ctx_b}, "influence"),
            self._run_section(COMPARE_ENGAGEMENT_PROMPT, {"name_a": name_a, "name_b": name_b, "person_a_engagement": ctx_a, "person_b_engagement": ctx_b}, "engagement"),
            self._run_section(COMPARE_RISK_PROMPT, {"name_a": name_a, "name_b": name_b, "person_a_risk": ctx_a, "person_b_risk": ctx_b}, "risk")
        ]
        
        results = await asyncio.gather(*tasks)
        
        # Build comparison map
        comparison_map = {}
        for res in results:
            comparison_map.update(res)

        # 3. Finally, run the Verdict section using the results of the others for master synthesis
        verdict_res = await self._run_section(
            COMPARE_VERDICT_PROMPT, 
            {
                "name_a": name_a, 
                "name_b": name_b, 
                "person_a_verdict": ctx_a, 
                "person_b_verdict": ctx_b,
                "overall_comparison_results": comparison_map
            }, 
            "verdict"
        )
        
        comparison_map.update(verdict_res)
        
        return comparison_map

    async def _run_section(self, prompt_template: str, inputs: Dict[str, Any], section_key: str) -> Dict[str, Any]:
        """
        Helper to format and run a specific comparison section.
        """
        try:
            prompt = prompt_template.format(**inputs)
            res = await self.gemini.generate_json(prompt, section_id=f"compare_{section_key}")
            # Ensure we wrap the data in the key the frontend expects
            return {section_key: res}
        except Exception as e:
            print(f"[ComparisonService Error] Section {section_key} failed: {str(e)}")
            return {section_key: {"error": str(e)}}
