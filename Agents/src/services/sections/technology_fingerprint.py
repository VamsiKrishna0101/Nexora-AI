from typing import Dict, Any
from src.services.report_service import ReportService

class TechnologyFingerprintService:
    def __init__(self):
        self.report_service = ReportService()

    def generate(self, raw_data: Dict[str, Any]) -> str:
        # Extract only what is necessary
        
        # Filter jobs for engineering/technical roles to save tokens
        jobs = raw_data.get("company_jobs", {}).get("jobs", [])
        tech_jobs = []
        if jobs:
            tech_keywords = ["engineer", "developer", "data", "cloud", "security", "machine learning", "ai", "backend", "frontend"]
            for job in jobs:
                if any(kw in job.get("title", "").lower() for kw in tech_keywords):
                    tech_jobs.append(job)
        
        filtered_data = {
            "company_data": raw_data.get("company_data"),
            "techstack": raw_data.get("techstack"),
            "tech_jobs_sample": tech_jobs[:5] if tech_jobs else None # Just pass a sample of tech jobs to check hiring signal
        }
        
        return self.report_service.generate_section("06_TECHNOLOGY_FINGERPRINT", filtered_data)
