from src.services.report_service import ReportService
from typing import TypedDict, List, Annotated, Any

class ReportState(TypedDict):
    # Input Data
    raw_data: dict # All raw company data in a single mega-object
    
    # Section Outputs
    section_01: Any
    section_02: Any
    section_03: Any
    section_04: Any
    section_05: Any
    section_06: Any
    section_07: Any
    section_08: Any
    section_09: Any
    section_10: Any
    section_11: Any # SWOT
    section_12: Any # Verdict
    
    # Metadata
    errors: List[str]

from src.services.sections.executive_brief import ExecutiveBriefService
from src.services.sections.market_position import MarketPositionService
from src.services.sections.product_intelligence import ProductIntelligenceService
from src.services.sections.financial_profile import FinancialProfileService
from src.services.sections.competitive_landscape import CompetitiveLandscapeService
from src.services.sections.technology_fingerprint import TechnologyFingerprintService
from src.services.sections.talent_org import TalentOrgService
from src.services.sections.leadership import LeadershipService
from src.services.sections.content_messaging import ContentMessagingService
from src.services.sections.strategic_signals import StrategicSignalsService
from src.services.report_service import ReportService

class Nodes:
    def __init__(self):
        self.report_service = ReportService() # Used for SWOT and Verdict aggregations
        self.s01_service = ExecutiveBriefService()
        self.s02_service = MarketPositionService()
        self.s03_service = ProductIntelligenceService()
        self.s04_service = FinancialProfileService()
        self.s05_service = CompetitiveLandscapeService()
        self.s06_service = TechnologyFingerprintService()
        self.s07_service = TalentOrgService()
        self.s08_service = LeadershipService()
        self.s09_service = ContentMessagingService()
        self.s10_service = StrategicSignalsService()

    def parallel_analysis_node(self, state: ReportState):
        import concurrent.futures
        
        # We use a thread pool to execute the 10 independent sections simultaneously
        with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
            raw = state["raw_data"]
            f01 = executor.submit(self.s01_service.generate, raw)
            f02 = executor.submit(self.s02_service.generate, raw)
            f03 = executor.submit(self.s03_service.generate, raw)
            f04 = executor.submit(self.s04_service.generate, raw)
            f05 = executor.submit(self.s05_service.generate, raw)
            f06 = executor.submit(self.s06_service.generate, raw)
            f07 = executor.submit(self.s07_service.generate, raw)
            f08 = executor.submit(self.s08_service.generate, raw)
            f09 = executor.submit(self.s09_service.generate, raw)
            f10 = executor.submit(self.s10_service.generate, raw)
            
            return {
                "section_01": f01.result(),
                "section_02": f02.result(),
                "section_03": f03.result(),
                "section_04": f04.result(),
                "section_05": f05.result(),
                "section_06": f06.result(),
                "section_07": f07.result(),
                "section_08": f08.result(),
                "section_09": f09.result(),
                "section_10": f10.result(),
            }

    # Aggregator Node (SWOT)
    def swot_node(self, state: ReportState):
        summaries = "\n\n".join([
            state.get("section_01", ""), 
            state.get("section_02", ""),
            state.get("section_03", ""),
            state.get("section_04", ""),
            state.get("section_05", ""),
            state.get("section_06", ""),
            state.get("section_07", ""),
            state.get("section_08", ""),
            state.get("section_09", ""),
            state.get("section_10", "")
        ])
        return {"section_11": self.report_service.generate_summary("11_SWOT", summaries)}

    # Final Node (Analyst Verdict)
    def verdict_node(self, state: ReportState):
        summaries = "\n\n".join([
            state.get("section_11", ""), # SWOT
            state.get("section_01", ""), 
            state.get("section_12", "")
        ])
        return {"section_12": self.report_service.generate_summary("12_ANALYST_VERDICT", summaries)}