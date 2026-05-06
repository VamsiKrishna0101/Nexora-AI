from typing import Dict, Any
from src.services.report_service import ReportService

class ContentMessagingService:
    def __init__(self):
        self.report_service = ReportService()

    def generate(self, raw_data: Dict[str, Any]) -> str:
        # Extract only what is necessary
        filtered_data = {
            "company_data": raw_data.get("company_data"),
            "newsfeed": raw_data.get("newsfeed"),
            "linkedin_posts": raw_data.get("linkedin_posts", [])[:10] if raw_data.get("linkedin_posts") else None,
        }
        
        return self.report_service.generate_section("09_CONTENT_MESSAGING", filtered_data)
