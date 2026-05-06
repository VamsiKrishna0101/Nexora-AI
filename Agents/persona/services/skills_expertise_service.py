import json
from typing import Dict, Any, Optional, List
from persona.services.gemini_service import GeminiService
from persona.prompts.prompt import SKILLS_EXPERTISE_PROMPT


class SkillsExpertiseService:
    def __init__(self):
        self.gemini = GeminiService()

    def generate(self, linkedin_data: Optional[Dict], linkedin_posts: Optional[List]) -> Dict:
        prompt = SKILLS_EXPERTISE_PROMPT.format(
            linkedin_data=json.dumps(linkedin_data or {}, indent=2),
            linkedin_posts=json.dumps([p.model_dump() if hasattr(p, 'model_dump') else p for p in (linkedin_posts or [])], indent=2),
        )
        return self.gemini.generate_json_sync(prompt, section_id="S03")