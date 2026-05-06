import json
from typing import Dict, Any, Optional
from persona.services.gemini_service import GeminiService
from persona.prompts.prompt import NETWORK_INFLUENCE_PROMPT


class NetworkInfluenceService:
    def __init__(self):
        self.gemini = GeminiService()

    def generate(
        self,
        linkedin_data: Optional[Dict],
        web_snippets: Optional[str],
    ) -> Dict:
        prompt = NETWORK_INFLUENCE_PROMPT.format(
            linkedin_data=json.dumps(linkedin_data or {}, indent=2),
            web_snippets=web_snippets or "No web snippets found",
        )
        return self.gemini.generate_json_sync(prompt, section_id="S07")
