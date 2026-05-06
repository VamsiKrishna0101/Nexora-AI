from typing import Dict, Any
from persona.services.gemini_service import GeminiService
from persona.compare.context_extractor import extract_comparison_context
from persona.prompts.prompt import COMPARE_SNAPSHOT_PROMPT

class SnapshotService:
    def __init__(self):
        self.gemini = GeminiService()
    
    async def generate_snapshot(self, persona1_data: Dict[str, Any], persona2_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generates a quick high-level head-to-head snapshot between two personas.
        """
        # 1. Distill contexts
        ctx_a = extract_comparison_context(persona1_data)
        ctx_b = extract_comparison_context(persona2_data)
        
        name_a = ctx_a["name"]
        name_b = ctx_b["name"]
        
        # 2. Run Snapshot Intelligence
        try:
            prompt = COMPARE_SNAPSHOT_PROMPT.format(
                name_a=name_a,
                name_b=name_b,
                person_a_context=ctx_a,
                person_b_context=ctx_b
            )
            return await self.gemini.generate_json(prompt, section_id="compare_snapshot")
        except Exception as e:
            print(f"[SnapshotService Error] Failed: {str(e)}")
            return {"error": str(e)}
