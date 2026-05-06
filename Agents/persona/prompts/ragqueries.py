# =============================================================================
# FORENSIC INTELLIGENCE RAG QUERY LIBRARY (STABLE)
# Optimized thematic queries for deep-dive executive analysis.
# =============================================================================

# Theme 1 — Network Density & Influence
NETWORK_DENSITY_RAG_QUERIES = [
    "Who are the board members and investors that have worked with {target_name} across multiple companies?",
    "{target_name} board memberships advisory roles career history",
    "{target_name} co-founders investors mentors professional relationships",
    "{target_name} SEC filings board of directors executives",
    "Who backed {target_name} companies funding rounds investors"
]

# Theme 3 — Career Anomaly Detection
CAREER_ANOMALY_RAG_QUERIES = [
    "{target_name} full career history LinkedIn employment timeline",
    "{target_name} left resigned fired departed company reason",
    "{target_name} career gap sabbatical break employment",
    "{target_name} promotion timeline role changes years",
    "{target_name} industry peers career progression benchmark"
]

# Theme 4 — Reputation & Controversy Intelligence
REPUTATION_RAG_QUERIES = [
    "{target_name} controversy scandal criticism backlash",
    "{target_name} lawsuit legal dispute regulatory issue",
    "{target_name} negative press coverage criticism",
    "{target_name} employee reviews glassdoor leadership",
    "{target_name} public apology statement correction retraction"
]

# Theme 5 — Thought Leadership & Content Intelligence
THOUGHT_LEADERSHIP_RAG_QUERIES = [
    "{target_name} articles blog posts publications written",
    "{target_name} podcast interview speaker conference talk",
    "{target_name} keynote speech TEDx panel discussion",
    "{target_name} opinion piece viewpoint published",
    "{target_name} Twitter LinkedIn content topics engagement"
]

# Theme 6 — Psychological Safety & Communication Risk
COMMUNICATION_RISK_RAG_QUERIES = [
    "{target_name} communication style leadership approach team culture",
    "{target_name} difficult challenging controversial statement public",
    "{target_name} employee feedback management style review",
    "{target_name} crisis communication response handling pressure",
    "{target_name} Twitter X deleted post retraction public mistake"
]

# Theme 7 — High-Conversion Sales Pitch Intelligence
SALES_PITCH_RAG_QUERIES = [
    "{target_name} business priorities goals 2024 2025",
    "{company_name} pain points challenges industry headwind",
    "{target_name} previous technology choices vendors partnerships",
    "{target_name} what they look for in a partner vendor",
    "{target_name} investment focus capital allocation priorities"
]


def get_engagement_battle_plan_chunks(comparison_id, persona_a_id, persona_b_id, user_question):
    comp_ns = f"{persona_a_id}_{persona_b_id}"
    queries = [
        {
            "query": f"engagement tactics outreach how to approach contact {user_question}",
            "filter": {"section": {"$in": ["compare_engagement", "compare_verdict"]}},
            "namespace": comp_ns,
            "top_k": 4
        },
        {
            "query": f"engagement guide how to open email meeting dos donts topics avoid {user_question}",
            "filter": {"section": {"$in": ["how_to_engage", "personality_analysis"]}},
            "namespace": persona_a_id,
            "top_k": 3
        },
        {
            "query": f"engagement guide how to open email meeting dos donts topics avoid {user_question}",
            "filter": {"section": {"$in": ["how_to_engage", "personality_analysis"]}},
            "namespace": persona_b_id,
            "top_k": 3
        }
    ]
    return queries

def get_behavioral_tension_chunks(comparison_id, persona_a_id, persona_b_id, user_question):
    comp_ns = f"{persona_a_id}_{persona_b_id}"
    queries = [
        {
            "query": f"behavioral contrast personality tension interaction working style conflict {user_question}",
            "filter": {"section": {"$in": ["compare_behavior", "compare_verdict"]}},
            "namespace": comp_ns,
            "top_k": 5
        },
        {
            "query": f"working style decision making blind spots what drives energizers drainers {user_question}",
            "filter": {"section": {"$in": ["personality_analysis"]}},
            "namespace": persona_a_id,
            "top_k": 3
        },
        {
            "query": f"working style decision making blind spots what drives energizers drainers {user_question}",
            "filter": {"section": {"$in": ["personality_analysis"]}},
            "namespace": persona_b_id,
            "top_k": 3
        }
    ]
    return queries

def get_skills_power_gap_chunks(comparison_id, persona_a_id, persona_b_id, user_question):
    comp_ns = f"{persona_a_id}_{persona_b_id}"
    queries = [
        {
            "query": f"skills overlap venn expertise dominance complementary gap {user_question}",
            "filter": {"section": {"$in": ["compare_skills", "compare_verdict"]}},
            "namespace": comp_ns,
            "top_k": 4
        },
        {
            "query": f"domain expertise technical skills evidence progression narrative {user_question}",
            "filter": {"section": {"$in": ["skills_expertise"]}},
            "namespace": persona_a_id,
            "top_k": 3
        },
        {
            "query": f"domain expertise technical skills evidence progression narrative {user_question}",
            "filter": {"section": {"$in": ["skills_expertise"]}},
            "namespace": persona_b_id,
            "top_k": 3
        }
    ]
    return queries

def get_influence_credibility_chunks(comparison_id, persona_a_id, persona_b_id, user_question):
    comp_ns = f"{persona_a_id}_{persona_b_id}"
    queries = [
        {
            "query": f"influence network credibility reach platform metrics tier endorsement {user_question}",
            "filter": {"section": {"$in": ["compare_influence", "compare_verdict"]}},
            "namespace": comp_ns,
            "top_k": 4
        },
        {
            "query": f"online presence linkedin followers media mentions network reach notable collaborations {user_question}",
            "filter": {"section": {"$in": ["online_presence", "network_influence"]}},
            "namespace": persona_a_id,
            "top_k": 3
        },
        {
            "query": f"online presence linkedin followers media mentions network reach notable collaborations {user_question}",
            "filter": {"section": {"$in": ["online_presence", "network_influence"]}},
            "namespace": persona_b_id,
            "top_k": 3
        }
    ]
    return queries

def get_strategic_verdict_chunks(comparison_id, persona_a_id, persona_b_id, user_question):
    comp_ns = f"{persona_a_id}_{persona_b_id}"
    queries = [
        {
            "query": f"strategic verdict compatibility deal intelligence recommendation use case bottom line {user_question}",
            "filter": {"section": {"$in": [
                "compare_verdict",
                "compare_behavior",
                "compare_skills",
                "compare_influence"
            ]}},
            "namespace": comp_ns,
            "top_k": 6
        },
        {
            "query": f"analyst verdict profile strength key strengths concerns recommended use cases {user_question}",
            "filter": {"section": {"$in": ["analyst_verdict", "red_flags"]}},
            "namespace": persona_a_id,
            "top_k": 2
        },
        {
            "query": f"analyst verdict profile strength key strengths concerns recommended use cases {user_question}",
            "filter": {"section": {"$in": ["analyst_verdict", "red_flags"]}},
            "namespace": persona_b_id,
            "top_k": 2
        }
    ]
    return queries

def get_network_collision_chunks(comparison_id, persona_a_id, persona_b_id, user_question):
    comp_ns = f"{persona_a_id}_{persona_b_id}"
    queries = [
        {
            "query": f"shared networks investors board members hidden ties collision shadows cabal {user_question}",
            "filter": {"section": {"$in": ["compare_influence", "network_influence"]}},
            "namespace": comp_ns,
            "top_k": 4
        },
        {
            "query": f"alumni networks investors board members shared mentors associations {user_question}",
            "filter": {"section": {"$in": ["network_influence", "professional_background"]}},
            "namespace": persona_a_id,
            "top_k": 4
        },
        {
            "query": f"alumni networks investors board members shared mentors associations {user_question}",
            "filter": {"section": {"$in": ["network_influence", "professional_background"]}},
            "namespace": persona_b_id,
            "top_k": 4
        }
    ]
    return queries

def get_executive_dominance_chunks(comparison_id, persona_a_id, persona_b_id, user_question):
    comp_ns = f"{persona_a_id}_{persona_b_id}"
    queries = [
        {
            "query": f"executive dominance leverage power dynamics negotiation leadership hierarchy {user_question}",
            "filter": {"section": {"$in": ["compare_behavior", "compare_verdict"]}},
            "namespace": comp_ns,
            "top_k": 4
        },
        {
            "query": f"personality traits dominance risk appetite communication style management approach {user_question}",
            "filter": {"section": {"$in": ["personality_analysis"]}},
            "namespace": persona_a_id,
            "top_k": 4
        },
        {
            "query": f"personality traits dominance risk appetite communication style management approach {user_question}",
            "filter": {"section": {"$in": ["personality_analysis"]}},
            "namespace": persona_b_id,
            "top_k": 4
        }
    ]
    return queries

def get_adversarial_maneuver_chunks(comparison_id, persona_a_id, persona_b_id, user_question):
    comp_ns = f"{persona_a_id}_{persona_b_id}"
    queries = [
        {
            "query": f"adversarial conflict sabotage counter-move zero-sum strategic clash {user_question}",
            "filter": {"section": {"$in": ["compare_behavior", "compare_verdict", "red_flags"]}},
            "namespace": comp_ns,
            "top_k": 5
        },
        {
            "query": f"blind spots weaknesses red flags risks vulnerabilities controversies {user_question}",
            "filter": {"section": {"$in": ["red_flags", "personality_analysis"]}},
            "namespace": persona_a_id,
            "top_k": 3
        },
        {
            "query": f"blind spots weaknesses red flags risks vulnerabilities controversies {user_question}",
            "filter": {"section": {"$in": ["red_flags", "personality_analysis"]}},
            "namespace": persona_b_id,
            "top_k": 3
        }
    ]
    return queries
