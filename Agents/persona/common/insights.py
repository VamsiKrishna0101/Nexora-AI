from typing import Dict, Any
from datetime import datetime
from persona.prompts.ragqueries import (
    NETWORK_DENSITY_RAG_QUERIES,
    CAREER_ANOMALY_RAG_QUERIES,
    REPUTATION_RAG_QUERIES,
    THOUGHT_LEADERSHIP_RAG_QUERIES,
    COMMUNICATION_RISK_RAG_QUERIES,
    SALES_PITCH_RAG_QUERIES,
    get_engagement_battle_plan_chunks,
    get_behavioral_tension_chunks,
    get_skills_power_gap_chunks,
    get_influence_credibility_chunks,
    get_strategic_verdict_chunks,
    get_network_collision_chunks,
    get_executive_dominance_chunks,
    get_adversarial_maneuver_chunks
)
from src.prompts.companyragquery import RAG_QUERIES as COMPANY_RAG_QUERIES
from persona.prompts.prompt import (
    NETWORK_DENSITY_PROMPT,
    CAREER_ANOMALY_PROMPT,
    REPUTATION_PROMPT,
    THOUGHT_LEADERSHIP_PROMPT,
    COMMUNICATION_RISK_PROMPT,
    SALES_PITCH_PROMPT,
    ENGAGEMENT_BATTLE_PLAN_PROMPT,
    BEHAVIORAL_TENSION_PROMPT,
    SKILLS_POWER_GAP_PROMPT,
    INFLUENCE_CREDIBILITY_PROMPT,
    STRATEGIC_VERDICT_PROMPT,
    NETWORK_COLLISION_PROMPT,
    EXECUTIVE_DOMINANCE_PROMPT,
    ADVERSARIAL_MANEUVER_PROMPT
)
from src.prompts import templates

from persona.services.gemini_service import GeminiService
from persona.services.rag_service import RagService
from src.services.backend_client import BackendClient
from persona.compare.context_extractor import extract_comparison_context

# =============================================================================
# FORENSIC INTELLIGENCE REGISTRY
# Central configuration for all forensic thematic analyses.
# =============================================================================

FORENSIC_INTELLIGENCE_REGISTRY = [
    {
        "id": "network_density",
        "name": "Network Density & Influence Analysis",
        "type": "single",
        "queries": NETWORK_DENSITY_RAG_QUERIES,
        "prompt": NETWORK_DENSITY_PROMPT,
        "input_keys": ["career_history", "board_memberships", "network_signals", "news_mentions", "filings"]
    },
    {
        "id": "career_anomaly",
        "name": "Career Trajectory Anomaly Detection",
        "type": "single",
        "queries": CAREER_ANOMALY_RAG_QUERIES,
        "prompt": CAREER_ANOMALY_PROMPT,
        "input_keys": ["career_history", "peer_benchmarks", "education", "compensation_events"]
    },
    {
        "id": "reputation_intelligence",
        "name": "Reputation & Controversy Intelligence",
        "type": "single",
        "queries": REPUTATION_RAG_QUERIES,
        "prompt": REPUTATION_PROMPT,
        "input_keys": ["news_articles", "legal_filings", "employee_reviews", "social_controversies", "public_statements"]
    },
    {
        "id": "thought_leadership",
        "name": "Thought Leadership & Content Intelligence",
        "type": "single",
        "queries": THOUGHT_LEADERSHIP_RAG_QUERIES,
        "prompt": THOUGHT_LEADERSHIP_PROMPT,
        "input_keys": ["articles", "podcasts", "talks", "linkedin_posts", "twitter_posts"]
    },
    {
        "id": "communication_risk",
        "name": "Communication Risk & Psychological Safety Profile",
        "type": "single",
        "queries": COMMUNICATION_RISK_RAG_QUERIES,
        "prompt": COMMUNICATION_RISK_PROMPT,
        "input_keys": ["public_statements", "crisis_responses", "employee_feedback", "social_media", "interviews"]
    },
    {
        "id": "sales_pitch",
        "name": "High-Conversion Sales Pitch Intelligence",
        "type": "single",
        "queries": SALES_PITCH_RAG_QUERIES,
        "prompt": SALES_PITCH_PROMPT,
        "input_keys": ["business_priorities", "pain_points", "tech_history", "investment_focus"]
    },
    {
        "id": "network_collision",
        "name": "Network DNA & Collision Map",
        "type": "compare",
        "queries": [],
        "prompt": NETWORK_COLLISION_PROMPT,
        "input_keys": []
    },
    {
        "id": "executive_dominance",
        "name": "Executive Dominance & Prowess",
        "type": "compare",
        "queries": [],
        "prompt": EXECUTIVE_DOMINANCE_PROMPT,
        "input_keys": []
    },
    {
        "id": "behavioral_tension",
        "name": "Behavioral Tension & Synergy Analysis",
        "type": "compare",
        "queries": [],
        "prompt": BEHAVIORAL_TENSION_PROMPT,
        "input_keys": []
    },
    {
        "id": "adversarial_modeling",
        "name": "Adversarial Maneuver Pathways",
        "type": "compare",
        "queries": [],
        "prompt": ADVERSARIAL_MANEUVER_PROMPT,
        "input_keys": []
    },
    {
        "id": "strategic_verdict",
        "name": "Strategic Comparison Verdict",
        "type": "compare",
        "queries": [],
        "prompt": STRATEGIC_VERDICT_PROMPT,
        "input_keys": []
    },
    # --- COMPANY THEMES ---
    {
        "id": "capital_efficiency",
        "name": "Capital Efficiency & Runway Intelligence",
        "type": "company",
        "queries": COMPANY_RAG_QUERIES.get("CAPITAL_EFFICIENCY", []),
        "prompt": templates.CAPITAL_EFFICIENCY,
        "input_keys": ["data"]
    },
    {
        "id": "competitive_moat",
        "name": "Competitive Moat Durability",
        "type": "company",
        "queries": COMPANY_RAG_QUERIES.get("COMPETITIVE_MOAT", []),
        "prompt": templates.COMPETITIVE_MOAT,
        "input_keys": ["data"]
    },
    {
        "id": "leadership_risk",
        "name": "Leadership Risk & Execution Readiness",
        "type": "company",
        "queries": COMPANY_RAG_QUERIES.get("LEADERSHIP_RISK", []),
        "prompt": templates.LEADERSHIP_RISK,
        "input_keys": ["data"]
    },
    {
        "id": "market_timing",
        "name": "Market Timing & Tailwind Alignment",
        "type": "company",
        "queries": COMPANY_RAG_QUERIES.get("MARKET_TIMING", []),
        "prompt": templates.MARKET_TIMING,
        "input_keys": ["data"]
    },
    {
        "id": "strategic_signals",
        "name": "Strategic Signal Decoding",
        "type": "company",
        "queries": COMPANY_RAG_QUERIES.get("STRATEGIC_SIGNALS", []),
        "prompt": templates.STRATEGIC_SIGNALS,
        "input_keys": ["data"]
    },
    {
        "id": "exit_valuation",
        "name": "Exit & Valuation Thesis",
        "type": "company",
        "queries": COMPANY_RAG_QUERIES.get("EXIT_VALUATION", []),
        "prompt": templates.EXIT_VALUATION,
        "input_keys": ["data"]
    }
]



async def network_collision(comparison_id, report1_id, report2_id, user_question="Resolve shared hidden ties", token=None):
    gemini = GeminiService()
    rag = RagService()
    backend = BackendClient()

    p1_obj = backend.get_report(report1_id, token)
    p2_obj = backend.get_report(report2_id, token)
    
    ctx1 = extract_comparison_context(p1_obj.get("report_data", {}) if isinstance(p1_obj, dict) else {})
    ctx2 = extract_comparison_context(p2_obj.get("report_data", {}) if isinstance(p2_obj, dict) else {})

    queries = get_network_collision_chunks(comparison_id, report1_id, report2_id, user_question)
    batch_results = await rag.query_batch(queries)
    retrieved_chunks = "\n\n".join([f"--- {res.get('metadata', {}).get('section', 'Unknown')} ---\n{res.get('text', '')}" for res in batch_results])

    prompt = NETWORK_COLLISION_PROMPT.format(
        person_a_name=ctx1["name"],
        person_b_name=ctx2["name"],
        retrieved_chunks=retrieved_chunks
    )
    return await gemini.generate_text(prompt)

async def executive_dominance(comparison_id, report1_id, report2_id, user_question="Model power dynamics", token=None):
    gemini = GeminiService()
    rag = RagService()
    backend = BackendClient()

    p1_obj = backend.get_report(report1_id, token)
    p2_obj = backend.get_report(report2_id, token)
    
    ctx1 = extract_comparison_context(p1_obj.get("report_data", {}) if isinstance(p1_obj, dict) else {})
    ctx2 = extract_comparison_context(p2_obj.get("report_data", {}) if isinstance(p2_obj, dict) else {})

    queries = get_executive_dominance_chunks(comparison_id, report1_id, report2_id, user_question)
    batch_results = await rag.query_batch(queries)
    retrieved_chunks = "\n\n".join([f"--- {res.get('metadata', {}).get('section', 'Unknown')} ---\n{res.get('text', '')}" for res in batch_results])

    s1 = ctx1.get("trait_scores", {})
    s2 = ctx2.get("trait_scores", {})

    prompt = EXECUTIVE_DOMINANCE_PROMPT.format(
        person_a_name=ctx1["name"],
        person_a_traits=f"Dominance {s1.get('dominance',0)}, Risk {s1.get('risk_appetite',0)}",
        person_b_name=ctx2["name"],
        person_b_traits=f"Dominance {s2.get('dominance',0)}, Risk {s2.get('risk_appetite',0)}",
        retrieved_chunks=retrieved_chunks
    )
    return await gemini.generate_text(prompt)

async def adversarial_modeling(comparison_id, report1_id, report2_id, user_question="Model adversarial paths", token=None):
    gemini = GeminiService()
    rag = RagService()
    backend = BackendClient()

    p1_obj = backend.get_report(report1_id, token)
    p2_obj = backend.get_report(report2_id, token)
    
    ctx1 = extract_comparison_context(p1_obj.get("report_data", {}) if isinstance(p1_obj, dict) else {})
    ctx2 = extract_comparison_context(p2_obj.get("report_data", {}) if isinstance(p2_obj, dict) else {})

    queries = get_adversarial_maneuver_chunks(comparison_id, report1_id, report2_id, user_question)
    batch_results = await rag.query_batch(queries)
    retrieved_chunks = "\n\n".join([f"--- {res.get('metadata', {}).get('section', 'Unknown')} ---\n{res.get('text', '')}" for res in batch_results])

    prompt = ADVERSARIAL_MANEUVER_PROMPT.format(
        person_a_name=ctx1["name"],
        person_b_name=ctx2["name"],
        retrieved_chunks=retrieved_chunks
    )
    return await gemini.generate_text(prompt)

async def behavioral_tension(comparison_id, report1_id, report2_id, user_question="Analyze behavioral dynamics", token=None):
    """Analyzes behavioral friction and collaboration signals."""
    gemini = GeminiService()
    rag = RagService()
    backend = BackendClient()

    p1_obj = backend.get_report(report1_id, token)
    p2_obj = backend.get_report(report2_id, token)
    
    ctx1 = extract_comparison_context(p1_obj.get("report_data", {}) if isinstance(p1_obj, dict) else {})
    ctx2 = extract_comparison_context(p2_obj.get("report_data", {}) if isinstance(p2_obj, dict) else {})

    queries = get_behavioral_tension_chunks(comparison_id, report1_id, report2_id, user_question)
    batch_results = await rag.query_batch(queries)
    retrieved_chunks = "\n\n".join([f"--- {r.get('metadata', {}).get('section', 'Unknown')} ---\n{r.get('text', '')}" for r in batch_results])

    s1 = ctx1.get("trait_scores", {})
    s2 = ctx2.get("trait_scores", {})

    prompt = BEHAVIORAL_TENSION_PROMPT.format(
        person_a_name=ctx1["name"], person_a_archetype=ctx1["archetype"], person_a_trait_tags=ctx1["trait_tags"],
        person_b_name=ctx2["name"], person_b_archetype=ctx2["archetype"], person_b_trait_tags=ctx2["trait_tags"],
        a_dominance=s1.get("dominance", 0), a_pace=s1.get("pace", 0), a_pragmatism=s1.get("pragmatism", 0), a_risk=s1.get("risk_appetite", 0), a_expression=s1.get("expressiveness", 0), a_social=s1.get("social_energy", 0),
        b_dominance=s2.get("dominance", 0), b_pace=s2.get("pace", 0), b_pragmatism=s2.get("pragmatism", 0), b_risk=s2.get("risk_appetite", 0), b_expression=s2.get("expressiveness", 0), b_social=s2.get("social_energy", 0),
        retrieved_chunks=retrieved_chunks, user_question=user_question
    )

    return await gemini.generate_text(prompt)

async def skills_power_gap(comparison_id, report1_id, report2_id, user_question="Compare skill sets", token=None):
    """Analyzes technical and strategic skill gaps."""
    gemini = GeminiService()
    rag = RagService()
    backend = BackendClient()

    p1_obj = backend.get_report(report1_id, token)
    p2_obj = backend.get_report(report2_id, token)
    
    ctx1 = extract_comparison_context(p1_obj.get("report_data", {}) if isinstance(p1_obj, dict) else {})
    ctx2 = extract_comparison_context(p2_obj.get("report_data", {}) if isinstance(p2_obj, dict) else {})

    queries = get_skills_power_gap_chunks(comparison_id, report1_id, report2_id, user_question)
    batch_results = await rag.query_batch(queries)
    retrieved_chunks = "\n\n".join([f"--- {r.get('metadata', {}).get('section', 'Unknown')} ---\n{r.get('text', '')}" for r in batch_results])

    prompt = SKILLS_POWER_GAP_PROMPT.format(
        person_a_name=ctx1["name"], person_a_title=ctx1["title"], person_a_company=ctx1["company"],
        person_b_name=ctx2["name"], person_b_title=ctx2["title"], person_b_company=ctx2["company"],
        retrieved_chunks=retrieved_chunks, user_question=user_question
    )

    return await gemini.generate_text(prompt)

async def influence_credibility(comparison_id, report1_id, report2_id, user_question="Compare influence", token=None):
    """Analyzes reach and credibility tiers."""
    gemini = GeminiService()
    rag = RagService()
    backend = BackendClient()

    p1_obj = backend.get_report(report1_id, token)
    p2_obj = backend.get_report(report2_id, token)
    
    ctx1 = extract_comparison_context(p1_obj.get("report_data", {}) if isinstance(p1_obj, dict) else {})
    ctx2 = extract_comparison_context(p2_obj.get("report_data", {}) if isinstance(p2_obj, dict) else {})

    queries = get_influence_credibility_chunks(comparison_id, report1_id, report2_id, user_question)
    batch_results = await rag.query_batch(queries)
    retrieved_chunks = "\n\n".join([f"--- {r.get('metadata', {}).get('section', 'Unknown')} ---\n{r.get('text', '')}" for r in batch_results])

    s1 = ctx1.get("online_presence_stats", {})
    s2 = ctx2.get("online_presence_stats", {})

    prompt = INFLUENCE_CREDIBILITY_PROMPT.format(
        person_a_name=ctx1["name"], a_linkedin_followers=s1.get("linkedin_followers", 0), a_avg_likes=s1.get("avg_likes", 0), a_network_reach=ctx1.get("network_reach", "Unknown"),
        person_b_name=ctx2["name"], b_linkedin_followers=s2.get("linkedin_followers", 0), b_avg_likes=s2.get("avg_likes", 0), b_network_reach=ctx2.get("network_reach", "Unknown"),
        retrieved_chunks=retrieved_chunks, user_question=user_question
    )

    return await gemini.generate_text(prompt)

async def strategic_verdict(comparison_id, report1_id, report2_id, user_question="Final strategic assessment", token=None):
    """Produces a final C-suite verdict and compatibility score."""
    gemini = GeminiService()
    rag = RagService()
    backend = BackendClient()

    p1_obj = backend.get_report(report1_id, token)
    p2_obj = backend.get_report(report2_id, token)
    
    ctx1 = extract_comparison_context(p1_obj.get("report_data", {}) if isinstance(p1_obj, dict) else {})
    ctx2 = extract_comparison_context(p2_obj.get("report_data", {}) if isinstance(p2_obj, dict) else {})

    queries = get_strategic_verdict_chunks(comparison_id, report1_id, report2_id, user_question)
    batch_results = await rag.query_batch(queries)
    retrieved_chunks = "\n\n".join([f"--- {r.get('metadata', {}).get('section', 'Unknown')} ---\n{r.get('text', '')}" for r in batch_results])

    prompt = STRATEGIC_VERDICT_PROMPT.format(
        person_a_name=ctx1["name"], a_profile_score=ctx1.get("profile_strength_score", 0), a_risk_rating=ctx1.get("risk_rating", "Unknown"),
        person_b_name=ctx2["name"], b_profile_score=ctx2.get("profile_strength_score", 0), b_risk_rating=ctx2.get("risk_rating", "Unknown"),
        compatibility_score=0,
        date=datetime.now().strftime("%Y-%m-%d"),
        retrieved_chunks=retrieved_chunks, user_question=user_question
    )

    return await gemini.generate_text(prompt)