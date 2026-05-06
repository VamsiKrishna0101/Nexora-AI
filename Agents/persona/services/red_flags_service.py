import json
from typing import Dict, Any, Optional, List
from persona.services.gemini_service import GeminiService
from persona.prompts.prompt import RED_FLAGS_PROMPT


class RedFlagsService:
    def __init__(self):
        self.gemini = GeminiService()

    def generate(
        self,
        linkedin_data: Optional[Dict],
        web_snippets: Optional[str],
        twitter_posts: Optional[List],
    ) -> Dict:
        prompt = RED_FLAGS_PROMPT.format(
            linkedin_data=json.dumps(linkedin_data or {}, indent=2),
            web_snippets=web_snippets or "No web data found",
            twitter_posts=json.dumps([p.model_dump() if hasattr(p, 'model_dump') else p for p in (twitter_posts or [])], indent=2),
        )
        return self.gemini.generate_json_sync(prompt, section_id="S10")
