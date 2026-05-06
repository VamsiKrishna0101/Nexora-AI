from langgraph.graph import StateGraph, END
from persona.nodes import PersonaNodes
from src.state import AppState


def create_persona_graph():
    nodes = PersonaNodes()
    workflow = StateGraph(AppState)

    # ---- Register all nodes ----
    # Renamed nodes with _node suffix to avoid collision with AppState attributes
    workflow.add_node("identity_node",                nodes.identity_node)
    workflow.add_node("professional_background_node", nodes.professional_background_node)
    workflow.add_node("skills_expertise_node",        nodes.skills_expertise_node)
    workflow.add_node("personality_node",             nodes.personality_node)
    workflow.add_node("online_presence_node",         nodes.online_presence_node)
    workflow.add_node("content_thought_node",         nodes.content_thought_leadership_node)
    workflow.add_node("network_influence_node",       nodes.network_influence_node)
    workflow.add_node("achievements_node",            nodes.achievements_node)
    workflow.add_node("red_flags_node",               nodes.red_flags_node)
    workflow.add_node("how_to_engage_node",           nodes.how_to_engage_node)
    workflow.add_node("social_post_node",             nodes.social_post_intelligence_node)
    workflow.add_node("analyst_verdict_node",         nodes.analyst_verdict_node)

    # ---- SEQUENTIAL PIPELINE ----
    workflow.set_entry_point("identity_node")
    workflow.add_edge("identity_node",                "professional_background_node")
    workflow.add_edge("professional_background_node", "skills_expertise_node")
    workflow.add_edge("skills_expertise_node",        "personality_node")
    workflow.add_edge("personality_node",             "online_presence_node")
    workflow.add_edge("online_presence_node",         "content_thought_node")
    workflow.add_edge("content_thought_node",         "social_post_node")
    workflow.add_edge("social_post_node",             "network_influence_node")
    workflow.add_edge("network_influence_node",       "achievements_node")
    workflow.add_edge("achievements_node",            "red_flags_node")
    workflow.add_edge("red_flags_node",               "how_to_engage_node")
    workflow.add_edge("how_to_engage_node",           "analyst_verdict_node")
    workflow.add_edge("analyst_verdict_node",         END)

    return workflow.compile()


# Compiled singleton for import
persona_graph = create_persona_graph()
