import json
from typing import Dict, Any, Optional, List
from persona.services.gemini_service import GeminiService
from persona.prompts.prompt import PERSONALITY_PROMPT


class PersonalityService:
    def __init__(self):
        self.gemini = GeminiService()

    def generate(
        self,
        linkedin_posts: Optional[List],
        twitter_posts: Optional[List],
        about_section: Optional[str],
    ) -> Dict:
        prompt = PERSONALITY_PROMPT.format(
            linkedin_posts=json.dumps([p.model_dump() if hasattr(p, 'model_dump') else p for p in (linkedin_posts or [])], indent=2),
            twitter_posts=json.dumps([p.model_dump() if hasattr(p, 'model_dump') else p for p in (twitter_posts or [])], indent=2),
            about_section=about_section or "Not available",
        )
        return self.gemini.generate_json_sync(prompt, section_id="S04")
