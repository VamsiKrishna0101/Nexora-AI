import json
import ast
from typing import Dict, Any

def _ensure_dict(val: Any) -> Dict[str, Any]:
    """Ensures a value is a dictionary, parsing it if it's a string."""
    if isinstance(val, dict):
        return val
    if isinstance(val, str):
        try:
            # Try standard JSON first
            return json.loads(val)
        except json.JSONDecodeError:
            try:
                # Fallback to ast.literal_eval for Python-style stringified dicts (with single quotes)
                return ast.literal_eval(val)
            except:
                return {}
    return {}

def extract_comparison_context(persona_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Extracts a high-density comparison context from a full persona report.
    Handles sections that might be stored as stringified JSON or Python dicts.
    """
    sections = _ensure_dict(persona_data.get("sections", {}))
    subject = _ensure_dict(persona_data.get("subject", {}))
    
    def get_sec_data(key: str) -> Dict[str, Any]:
        return _ensure_dict(_ensure_dict(sections.get(key, {})).get("data", {}))
    
    # Personality markers
    personality = get_sec_data("personality_analysis")
    behavioral_profile = _ensure_dict(personality.get("behavioral_profile", {}))
    
    # Presence & Influence
    online_presence = get_sec_data("online_presence")
    network_influence = get_sec_data("network_influence")
    
    # Performance & Risk
    red_flags = get_sec_data("red_flags")
    verdict = get_sec_data("analyst_verdict")
    
    # Career & Skills
    career = get_sec_data("professional_journey")
    skills = get_sec_data("skills_expertise")
    engagement = get_sec_data("how_to_engage")

    return {
        "name": subject.get("name"),
        "title": subject.get("title") or subject.get("designation"),
        "company": subject.get("company"),
        "photo_url": subject.get("photo_url") or subject.get("profile_picture_url") or subject.get("profile_photo_url"),
        "archetype": behavioral_profile.get("archetype"),
        "trait_tags": behavioral_profile.get("trait_tags", []),
        "trait_scores": personality.get("trait_scores", {}),
        "working_style": personality.get("working_style", {}),
        "engagement_guide": personality.get("engagement_guide", {}),
        "dos_donts": personality.get("dos_and_donts", {}),
        "influence_score": subject.get("influence_score", 0),
        "confidence_indicator": verdict.get("profile_strength_score") or subject.get("confidence_score", 0),
        "online_presence_stats": {
            "linkedin_followers": online_presence.get("linkedin_profile_summary", {}).get("followers") or online_presence.get("linkedin", {}).get("followers"),
            "posting_frequency": online_presence.get("linkedin_profile_summary", {}).get("posting_frequency") or online_presence.get("linkedin", {}).get("posting_frequency"),
            "avg_likes": online_presence.get("linkedin_profile_summary", {}).get("avg_likes_per_post") or online_presence.get("linkedin", {}).get("avg_likes_per_post")
        },
        "network_reach": network_influence.get("reach_and_amplification", {}).get("network_reach") or network_influence.get("network_reach"),
        "top_skills": skills.get("top_technical_skills", []),
        "domain_expertise": skills.get("domain_expertise_areas", []) or skills.get("domain_expertise", []),
        "risk_rating": red_flags.get("overall_risk_rating"),
        "profile_strength_score": verdict.get("profile_strength_score"),
        "recommended_use_cases": verdict.get("recommended_use_cases", []),
        "key_strengths": verdict.get("key_strengths", []),
        "key_concerns": verdict.get("key_concerns", []),
        "full_career_summary": career.get("career_timeline_summary", "") or career.get("current_role_summary", ""),
        "total_years_exp": career.get("total_years_experience"),
        "notable_achievements": _ensure_dict(_ensure_dict(sections.get("recent_projects_partnerships", {})).get("data", {})).get("notable_achievements", []) or _ensure_dict(_ensure_dict(sections.get("professional_achievements", {})).get("data", {})).get("notable_achievements", []),
        "outreach_hooks": engagement.get("conversation_starters", [])
    }
