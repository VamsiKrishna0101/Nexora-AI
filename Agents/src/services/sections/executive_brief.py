from typing import Dict, Any
from src.services.report_service import ReportService

class ExecutiveBriefService:
    def __init__(self):
        self.report_service = ReportService()

    def generate(self, raw_data: Dict[str, Any]) -> str:
        # Extract only what is necessary
        filtered_data = {
            "company_data": raw_data.get("company_data"),
            "financials": {
                "stage": raw_data.get("financials", {}).get("funding_stage"),
                "total_raised": raw_data.get("financials", {}).get("total_funding"),
                "investors": raw_data.get("financials", {}).get("investors"),
            } if raw_data.get("financials") else None,
            "competitors": raw_data.get("competitors"),
        }
        
        return self.report_service.generate_section("01_EXECUTIVE_BRIEF", filtered_data)
