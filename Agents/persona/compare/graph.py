from langgraph.graph import StateGraph, END
from persona.compare.nodes import ComparisonNodes
from src.state import AppCompareState

class PersonaCompareGraph:
    def __init__(self):
        self.nodes = ComparisonNodes()
        self.workflow = StateGraph(AppCompareState)
        
        # 1. Add Nodes
        self.workflow.add_node("fetch_reports", self.nodes.fetch_reports_node)
        self.workflow.add_node("analyze_intelligence", self.nodes.intelligence_node)
        self.workflow.add_node("generate_verdict", self.nodes.verdict_node)
        self.workflow.add_node("persist_results", self.nodes.storage_node)
        
        # 2. Define Edges
        self.workflow.set_entry_point("fetch_reports")
        self.workflow.add_edge("fetch_reports", "analyze_intelligence")
        self.workflow.add_edge("analyze_intelligence", "generate_verdict")
        self.workflow.add_edge("generate_verdict", "persist_results")
        self.workflow.add_edge("persist_results", END)
        
        self.app = self.workflow.compile()

    async def run(self, report1_id: str, report2_id: str, token: str, user_id: str = None) -> dict:
        """
        Entry point to execute the comparison graph.
        """
        initial_state = {
            "report1_id": report1_id,
            "report2_id": report2_id,
            "user_id": user_id,
            "token": token,
            "rag_indexed": False,
            "errors": []
        }
        
        final_state = await self.app.ainvoke(initial_state)
        return final_state

# Global instance for use in endpoints
persona_compare_graph = PersonaCompareGraph()
