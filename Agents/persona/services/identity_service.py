import json
from typing import Dict, Any, Optional
from persona.services.gemini_service import GeminiService
from persona.prompts.prompt import IDENTITY_PROMPT


class IdentityService:
    def __init__(self):
        self.gemini = GeminiService()

    def generate(self, linkedin_data: Optional[Dict], twitter_data: Optional[Dict]) -> Dict:
        prompt = IDENTITY_PROMPT.format(
            linkedin_data=json.dumps(linkedin_data or {}, indent=2),
            twitter_data=json.dumps(twitter_data or {}, indent=2),
        )
        return self.gemini.generate_json_sync(prompt, section_id="S01")