import json
from typing import Dict, Any, Optional, List
from persona.services.gemini_service import GeminiService
from persona.prompts.prompt import ANALYST_VERDICT_PROMPT


class AnalystVerdictService:
    def __init__(self):
        self.gemini = GeminiService()

    def generate(self, all_sections: List[Dict]) -> Dict:
        """Consumes all previous 10 section outputs and produces the final verdict."""
        prompt = ANALYST_VERDICT_PROMPT.format(
            all_sections=json.dumps(all_sections, indent=2),
        )
        # Needs more tokens — it's consuming all 10 sections
        return self.gemini.generate_json_sync(prompt, section_id="S11")
