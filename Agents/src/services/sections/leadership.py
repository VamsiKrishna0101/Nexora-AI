from typing import Dict, Any
from src.services.report_service import ReportService

class LeadershipService:
    def __init__(self):
        self.report_service = ReportService()

    def generate(self, raw_data: Dict[str, Any]) -> str:
        # Extract only what is necessary
        
        # We need employees (specifically leaders) and linkedin_posts
        employees = raw_data.get("employees", [])
        leaders = []
        if employees:
            leader_keywords = ["ceo", "cto", "co-founder", "president", "vp", "chief", "founder", "director"]
            for emp in employees:
                if any(kw in emp.get("title", "").lower() for kw in leader_keywords):
                    leaders.append(emp)
        
        # If we couldn't find explicit leaders, just pass the first 5 employees
        filtered_data = {
            "company_data": raw_data.get("company_data"),
            "leadership_employees": leaders,
            "linkedin_posts": raw_data.get("linkedin_posts", [])[:10] if raw_data.get("linkedin_posts") else None,
        }
        
        return self.report_service.generate_section("08_LEADERSHIP_PERSONAS", filtered_data)
