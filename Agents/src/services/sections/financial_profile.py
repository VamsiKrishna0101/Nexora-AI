from typing import Dict, Any
from src.services.report_service import ReportService

class FinancialProfileService:
    def __init__(self):
        self.report_service = ReportService()

    def generate(self, raw_data: Dict[str, Any]) -> str:
        # Extract only what is necessary
        filtered_data = {
            "company_data": raw_data.get("company_data"),
            "financials": raw_data.get("financials"),
        }
        
        return self.report_service.generate_section("04_FINANCIAL_PROFILE", filtered_data)
