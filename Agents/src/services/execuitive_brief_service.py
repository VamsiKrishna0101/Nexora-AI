from src.services.chatgpt_service import GROQService
from src.prompts.templates import EXECUTIVE_BRIEF_PROMPT
from typing import Dict, Any

class ExecutiveBriefService:
    def __init__(self):
        self.groq_service = GROQService()
    
    def get_executive_brief(self, company_data: Dict[str, Any]) -> Dict[str, Any]:
        if not company_data:
            return {"success": False, "data": {}}
        
        prompt = EXECUTIVE_BRIEF_PROMPT.format(company_data=company_data)
        
        try:
            brief = self.groq_service.generate_executive_brief(prompt)
            return {
                "success": True,
                "data": brief
            }
        except Exception as e:
            print(f"[ExecutiveBriefService Error]: {str(e)}")
            return {"success": False, "error": str(e)}
