from typing import Dict, Any
from src.services.report_service import ReportService

class TalentOrgService:
    def __init__(self):
        self.report_service = ReportService()

    def generate(self, raw_data: Dict[str, Any]) -> str:
        # Extract only what is necessary
        filtered_data = {
            "company_data": raw_data.get("company_data"),
            "employees": raw_data.get("employees"),
            "company_jobs_sample": raw_data.get("company_jobs", {}).get("jobs", [])[:10] if raw_data.get("company_jobs") else None,
        }
        
        return self.report_service.generate_section("07_TALENT_ORG_INTELLIGENCE", filtered_data)
