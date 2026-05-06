from typing import Dict, Any
from src.services.report_service import ReportService

class CompetitiveLandscapeService:
    def __init__(self):
        self.report_service = ReportService()

    def generate(self, raw_data: Dict[str, Any]) -> str:
        # Extract only what is necessary
        filtered_data = {
            "company_data": raw_data.get("company_data"),
            "competitors": raw_data.get("competitors"),
        }
        
        return self.report_service.generate_section("05_COMPETITIVE_LANDSCAPE", filtered_data)
