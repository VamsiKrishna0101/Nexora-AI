from typing import Dict, Any
from src.services.report_service import ReportService

class MarketPositionService:
    def __init__(self):
        self.report_service = ReportService()

    def generate(self, raw_data: Dict[str, Any]) -> str:
        # Extract only what is necessary
        filtered_data = {
            "company_data": raw_data.get("company_data"),
            "competitors": raw_data.get("competitors"),
            "financials": {
                "stage": raw_data.get("financials", {}).get("funding_stage"),
                "total_raised": raw_data.get("financials", {}).get("total_funding")
            } if raw_data.get("financials") else None,
        }
        
        return self.report_service.generate_section("02_MARKET_POSITION", filtered_data)
