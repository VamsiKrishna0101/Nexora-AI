import json
from typing import Dict, Any, Optional, List
from persona.services.gemini_service import GeminiService
from persona.prompts.prompt import CONTENT_THOUGHT_LEADERSHIP_PROMPT


class ContentThoughtLeadershipService:
    def __init__(self):
        self.gemini = GeminiService()

    def generate(
        self,
        web_snippets: Optional[str],
        linkedin_posts: Optional[List],
        twitter_posts: Optional[List],
    ) -> Dict:
        prompt = CONTENT_THOUGHT_LEADERSHIP_PROMPT.format(
            web_snippets=web_snippets or "No web snippets found",
            linkedin_posts=json.dumps([p.model_dump() if hasattr(p, 'model_dump') else p for p in (linkedin_posts or [])], indent=2),
            twitter_posts=json.dumps([p.model_dump() if hasattr(p, 'model_dump') else p for p in (twitter_posts or [])], indent=2),
        )
        return self.gemini.generate_json_sync(prompt, section_id="S06")
