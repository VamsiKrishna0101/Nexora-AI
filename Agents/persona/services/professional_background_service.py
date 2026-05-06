import json
from typing import Dict, Any, Optional
from persona.services.gemini_service import GeminiService
from persona.prompts.prompt import PROFESSIONAL_BACKGROUND_PROMPT


class ProfessionalBackgroundService:
    def __init__(self):
        self.gemini = GeminiService()

    def generate(self, linkedin_data: Optional[Dict]) -> Dict:
        prompt = PROFESSIONAL_BACKGROUND_PROMPT.format(
            linkedin_data=json.dumps(linkedin_data or {}, indent=2),
        )
        return self.gemini.generate_json_sync(prompt, section_id="S02")
