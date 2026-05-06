import json
from typing import Dict, Any, Optional, List
from persona.services.gemini_service import GeminiService
from persona.prompts.prompt import HOW_TO_ENGAGE_PROMPT


class HowToEngageService:
    def __init__(self):
        self.gemini = GeminiService()

    def generate(
        self,
        personality_section: Optional[Dict],
        linkedin_posts: Optional[List],
        twitter_posts: Optional[List],
    ) -> Dict:
        prompt = HOW_TO_ENGAGE_PROMPT.format(
            # Section 4 output feeds directly into this prompt
            personality_section=json.dumps(personality_section or {}, indent=2),
            linkedin_posts=json.dumps([p.model_dump() if hasattr(p, 'model_dump') else p for p in (linkedin_posts or [])], indent=2),
            twitter_posts=json.dumps([p.model_dump() if hasattr(p, 'model_dump') else p for p in (twitter_posts or [])], indent=2),
        )
        return self.gemini.generate_json_sync(prompt, section_id="S08")
