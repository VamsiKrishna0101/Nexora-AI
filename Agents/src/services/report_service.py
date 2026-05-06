import json
from src.services.gemini_service import GeminiService
from src.prompts import templates
from typing import Dict, Any

class ReportService:
    def __init__(self):
        self.gemini_service = GeminiService()
    
    # Aggregate sections (SWOT, Verdict) need higher token limit
    AGGREGATE_SECTIONS = {"11_SWOT", "12_ANALYST_VERDICT"}
    
    def generate_section(self, section_id: str, data: Dict[str, Any]) -> str:
        """
        Generates a specific research section using the mapped template and provided data.
        """
        template_name = f"SECTION_{section_id}"
        template = getattr(templates, template_name, None)
        
        if not template:
            return f"[ERROR: Template for {section_id} not found]"
            
        # Optimization: LLAMA used to need JSON strings, but Gemini handles dicts better. 
        # However, for consistency with templates, we keep the JSON dump for now.
        prompt = template.format(data=json.dumps(data, indent=2))
        
        try:
            return self.gemini_service.generate_section(prompt)
        except Exception as e:
            return f"[ERROR generating {section_id}: {str(e)}]"

    def generate_summary(self, section_id: str, summaries: str) -> str:
        """
        Generates aggregate sections like SWOT and Verdict from previous outputs.
        """
        template_name = f"SECTION_{section_id}"
        template = getattr(templates, template_name, None)
        
        if not template:
            return f"[ERROR: Template for {section_id} not found]"
            
        prompt = template.format(summaries=summaries)
        
        try:
            return self.gemini_service.generate_aggregate(prompt)
        except Exception as e:
            return f"[ERROR generating {section_id}: {str(e)}]"
