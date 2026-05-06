from typing import Dict, Any
from src.services.report_service import ReportService

class ProductIntelligenceService:
    def __init__(self):
        self.report_service = ReportService()

    def generate(self, raw_data: Dict[str, Any]) -> str:
        # Extract only what is necessary
        filtered_data = {
            "company_data": raw_data.get("company_data"),
            "products": raw_data.get("products"),
        }
        
        return self.report_service.generate_section("03_PRODUCT_INTELLIGENCE", filtered_data)
