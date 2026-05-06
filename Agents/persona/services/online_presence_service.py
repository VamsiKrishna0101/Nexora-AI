import json
from typing import Dict, Any, Optional, List
from persona.services.gemini_service import GeminiService
from persona.prompts.prompt import ONLINE_PRESENCE_PROMPT


class OnlinePresenceService:
    def __init__(self):
        self.gemini = GeminiService()

    def generate(
        self,
        linkedin_data: Optional[Dict],
        linkedin_posts: Optional[List],
        twitter_data: Optional[Dict],
        twitter_posts: Optional[List],
        web_snippets: Optional[str],
    ) -> Dict:
        prompt = ONLINE_PRESENCE_PROMPT.format(
            linkedin_data=json.dumps(linkedin_data or {}, indent=2),
            linkedin_posts=json.dumps([p.model_dump() if hasattr(p, 'model_dump') else p for p in (linkedin_posts or [])], indent=2),
            twitter_data=json.dumps(twitter_data or {}, indent=2),
            twitter_posts=json.dumps([p.model_dump() if hasattr(p, 'model_dump') else p for p in (twitter_posts or [])], indent=2),
            web_snippets=web_snippets or "No web data available",
        )
        return self.gemini.generate_json_sync(prompt, section_id="S05")
