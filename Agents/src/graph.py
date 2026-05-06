from langgraph.graph import StateGraph, END
from src.nodes import Nodes, ReportState

def create_report_graph():
    nodes = Nodes()
    
    # Initialize the graph with the ReportState
    workflow = StateGraph(ReportState)
    
    # Add Parallel Execution Node (handles 01-10 internally via thread pool)
    workflow.add_node("parallel_analysis", nodes.parallel_analysis_node)
    
    # Add Sequential Nodes (11, 12)
    workflow.add_node("swot", nodes.swot_node)
    workflow.add_node("verdict", nodes.verdict_node)
    
    # Entry Point (executes all parallel nodes simultaneously inside the threading node)
    workflow.set_entry_point("parallel_analysis")
    
    # Join point (once 1-10 finished, go to SWOT)
    workflow.add_edge("parallel_analysis", "swot")
    workflow.add_edge("swot", "verdict")
    workflow.add_edge("verdict", END)
    
    # Compile the graph
    return workflow.compile()

# Instance of the compiled graph
agent_graph = create_report_graph()
