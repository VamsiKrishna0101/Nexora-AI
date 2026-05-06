from typing import Dict, Any
from src.services.report_service import ReportService

class StrategicSignalsService:
    def __init__(self):
        self.report_service = ReportService()

    def generate(self, raw_data: Dict[str, Any]) -> str:
        # Extract only what is necessary
        filtered_data = {
            "company_data": raw_data.get("company_data"),
            "newsfeed": raw_data.get("newsfeed"),
            "timeline": raw_data.get("timeline"),
            "financials": {
                "last_valuation": raw_data.get("financials", {}).get("valuation"),
                "total_raised": raw_data.get("financials", {}).get("total_funding"),
                "date": raw_data.get("financials", {}).get("last_funding_date")
            } if raw_data.get("financials") else None,
        }
        
        return self.report_service.generate_section("10_STRATEGIC_SIGNALS", filtered_data)
