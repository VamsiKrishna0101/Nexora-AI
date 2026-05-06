from typing import Dict, Any, Optional
from src.services.backend_client import BackendClient

async def save_persona_report(subject: Dict[str, Any], sections: Dict[str, Any], token: str) -> Optional[Dict[str, Any]]:
    """
    Saves the persona deep dive report to the PostgreSQL database via the BackendClient.
    Returns the saved report object with DB metadata.
    """
    try:
        client = BackendClient()
        
        # Use a special domain marker or the subject's company
        domain = f"persona:{subject.get('company', 'individual')}"
        company_name = f"Persona: {subject.get('name')}"
        
        # Prepare the full report payload
        report_payload = {
            "subject": subject,
            "sections": sections
        }
        
        report_obj = client.save_report(
            domain=domain,
            company_name=company_name,
            report_data=report_payload,
            token=token
        )
        
        if report_obj:
            print(f"[ReportService] Persona report for {subject.get('name')} saved with ID: {report_obj.get('id')}")
        else:
            print(f"[ReportService] Failed to save persona report for {subject.get('name')}.")
            
        return report_obj
    except Exception as e:
        print(f"[ReportService] Error saving report: {str(e)}")
        return None