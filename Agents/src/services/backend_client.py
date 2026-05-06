"""
Backend Client — reads the Mega-Object from the TypeScript Backend's /api/gather/read endpoint.
This is used by the Python Agent before generating a 12-section intelligence report.
"""

import os
import requests
from dotenv import load_dotenv
from typing import Dict, Any, Optional

load_dotenv()

class BackendClient:
    def __init__(self):
        self.base_url = os.getenv("BACKEND_URL", "http://localhost:8000")

    def get_mega_object(self, domain: str) -> Optional[Dict[str, Any]]:
        """
        Calls GET /api/gather/read?domain={domain} and returns the full Mega-Object.
        This contains all 11 data sources cached in the DB.
        """
        try:
            headers = {"x-internal-secret": os.getenv("INTERNAL_SECRET", "internal_fallback_secret")}
            response = requests.get(
                f"{self.base_url}/api/gather/read",
                params={"domain": domain},
                headers=headers,
                timeout=30
            )
            response.raise_for_status()
            body = response.json()

            if body.get("success"):
                return body.get("data")
            else:
                print(f"[BackendClient] Backend returned error: {body}")
                return None

        except Exception as e:
            print(f"[BackendClient] Failed to fetch mega object: {str(e)}")
            return None

    def trigger_gather(self, domain: str, token: str) -> Optional[Dict[str, Any]]:
        """
        Calls POST /api/gather/company to trigger full data gathering.
        Used if the mega-object is empty or incomplete.
        """
        try:
            headers = {"Authorization": f"Bearer {token}"}
            response = requests.post(
                f"{self.base_url}/api/gather/company",
                json={"domain": domain},
                headers=headers,
                timeout=120  # Gathering can take up to 2 minutes
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"[BackendClient] trigger_gather failed: {str(e)}")
            return None

    def save_report(self, domain: str, company_name: str, report_data: Dict[str, Any], token: str) -> Optional[Dict[str, Any]]:
        """
        Saves the generated intelligence report using the user's token.
        Returns the saved report object if successful.
        """
        try:
            headers = {"Authorization": f"Bearer {token}"}
            response = requests.post(
                f"{self.base_url}/api/reports",
                json={"domain": domain, "company_name": company_name, "report_data": report_data},
                headers=headers,
                timeout=10
            )
            response.raise_for_status()
            body = response.json()
            if body.get("success"):
                return body.get("report")
            return None
        except Exception as e:
            print(f"[BackendClient] save_report failed: {str(e)}")
            return None

    def save_company_report(self, domain: str, company_name: str, report_data: Dict[str, Any], token: str) -> Optional[Dict[str, Any]]:
        """
        Saves the generated company intelligence report (12 sections) using the user's token.
        """
        try:
            headers = {"Authorization": f"Bearer {token}"}
            response = requests.post(
                f"{self.base_url}/api/companies/save-full-report",
                json={"domain": domain, "company_name": company_name, "report_data": report_data},
                headers=headers,
                timeout=10
            )
            response.raise_for_status()
            body = response.json()
            if body.get("success"):
                return body
            return None
        except Exception as e:
            print(f"[BackendClient] save_company_report failed: {str(e)}")
            return None


    def get_report(self, report_id: str, token: str) -> Optional[Dict[str, Any]]:

        """
        Fetches a specific persona report by ID.
        """
        try:
            headers = {"Authorization": f"Bearer {token}"}
            response = requests.get(
                f"{self.base_url}/api/reports/{report_id}",
                headers=headers,
                timeout=10
            )
            response.raise_for_status()
            body = response.json()
            if body.get("success"):
                return body.get("data")
            return None
        except Exception as e:
            print(f"[BackendClient] get_report failed: {str(e)}")
            return None

    def save_comparison(self, report1_id: str, report2_id: str, comparison_data: Dict[str, Any], token: str) -> Optional[Dict[str, Any]]:
        """
        Saves a persona comparison result to the backend.
        """
        try:
            headers = {"Authorization": f"Bearer {token}"}
            response = requests.post(
                f"{self.base_url}/api/compare",
                json={
                    "report1_id": report1_id,
                    "report2_id": report2_id,
                    "comparison_data": comparison_data
                },
                headers=headers,
                timeout=10
            )
            response.raise_for_status()
            body = response.json()
            if body.get("success"):
                return body.get("comparison")
            return None
        except Exception as e:
            print(f"[BackendClient] save_comparison failed: {str(e)}")
            return None
