import os
import dataclasses
import requests
from concurrent.futures import ThreadPoolExecutor
from typing import Optional, Dict, Any, List

from persona.services.linkedin_service import LinkedinService
from persona.services.linkedinposts_service import LinkedinPostsService
from persona.services.twitter_service import TwitterService
from persona.services.twitterposts_service import TwitterPostsService
from persona.services.parallel_service import PersonaService as ParallelService
from persona.graph import persona_graph
from src.state import AppState, LinkedInState, TwitterState

def _to_dict(obj):
    """Recursively convert dataclasses/models to plain dicts."""
    if dataclasses.is_dataclass(obj) and not isinstance(obj, type):
        return dataclasses.asdict(obj)
    if hasattr(obj, "dict"): # Pydantic v1
        return obj.dict()
    if hasattr(obj, "model_dump"): # Pydantic v2
        return obj.model_dump()
    if isinstance(obj, list):
        return [_to_dict(i) for i in obj]
    return obj

def _search_serper(name: str, designation: str, company: str) -> str:
    """Fetch web search snippets about the person using Serper."""
    try:
        api_key = os.getenv("SERPER_API_KEY")
        if not api_key:
            return ""

        queries = [
            f'"{name}" {designation} {company}',
            f'"{name}" interview OR podcast OR article',
            f'"{name}" {company} news OR announcement',
        ]
        all_snippets = []
        for query in queries:
            res = requests.post(
                "https://google.serper.dev/search",
                json={"q": query},
                headers={"X-API-KEY": api_key, "Content-Type": "application/json"},
                timeout=8,
            )
            items = res.json().get("organic", [])[:3]
            for item in items:
                all_snippets.append(f"{item.get('title', '')}: {item.get('snippet', '')}")

        return "\n".join(all_snippets)
    except Exception as e:
        print(f"[PersonaRunner] Serper search failed: {e}")
        return ""

def run_persona_pipeline(
    name: str,
    designation: str,
    company: str,
    linkedin_url: Optional[str] = None,
    twitter_handle: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Main entry point for the Persona Deep Dive pipeline using AppState (Pydantic).
    """
    print(f"[PersonaRunner] Starting pipeline for: {name} @ {company}")

    # 1. Initialize State
    state = AppState(
        user_provided_name=name,
        user_provided_company=company,
        user_provided_designation=designation
    )

    # 2. Parallel Data Fetching
    def fetch_linkedin():
        if not linkedin_url:
            return None
        try:
            ls = LinkedinService()
            lp = LinkedinPostsService()
            
            profile_data = ls.scrape_profile(linkedin_url)
            posts_result = lp.get_company_posts(linkedin_url, max_posts=15)
            posts = _to_dict(posts_result.data) if posts_result.success else []
            
            return LinkedInState(
                raw_data=profile_data,
                posts=posts,
                **profile_data
            )
        except Exception as e:
            print(f"[PersonaRunner] LinkedIn fetch failed: {e}")
            return None

    def fetch_twitter():
        if not twitter_handle:
            return None
        try:
            ts = TwitterService()
            tps = TwitterPostsService()

            # Consolidated lookup: Get full profile and ID in one call
            user_obj = ts.get_user_by_username(twitter_handle)
            if not user_obj:
                print(f"[PersonaRunner] Could not resolve Twitter handle: {twitter_handle}")
                return None

            # User ID is obtained from resolution, used for posts
            tweets = tps.get_user_tweets(user_obj.id, count=20)
            
            return TwitterState(
                tweets=tweets,
                raw_data=_to_dict(user_obj),
                **_to_dict(user_obj)
            )
        except Exception as e:
            print(f"[PersonaRunner] Twitter fetch failed: {e}")
            return None

    from src.state import WebScrape
    def fetch_web() -> List[WebScrape]:
        try:
            ps = ParallelService(
                name=name, 
                designation=designation, 
                company=company,
                linkedin_url=linkedin_url,
                twitter_handle=twitter_handle
            )
            research_data = ps.retrieve_data()
            if not research_data:
                return []
            # Store the structured research as a JSON string for the nodes
            import json
            content = json.dumps(research_data, indent=2)
            return [WebScrape(url="parallel_ai_research", content=content)]
        except Exception as e:
            print(f"[PersonaRunner] Parallel AI fetch failed: {e}")
            return []

    with ThreadPoolExecutor(max_workers=3) as pool:
        f_li = pool.submit(fetch_linkedin)
        f_tw = pool.submit(fetch_twitter)
        f_web = pool.submit(fetch_web)

        state.linkedin = f_li.result()
        state.twitter = f_tw.result()
        state.web_scrapes = f_web.result()

    print(f"[PersonaRunner] Data fetched. LinkedIn: {'✓' if state.linkedin else '✗'} | "
          f"Twitter: {'✓' if state.twitter else '✗'} | Web: {'✓' if state.web_scrapes else '✗'}")

    # 3. Graph Execution
    initial_state_dict = state.model_dump()
    
    final_state_dict = persona_graph.invoke(initial_state_dict, config={"recursion_limit": 50}) or {}

    print(f"[PersonaRunner] Pipeline complete. Errors: {final_state_dict.get('errors', [])}")

    # 4. Return Final Result mapped to the schema we use
    return {
        "subject": {
            "name": name,
            "designation": designation,
            "company": company,
        },
        "sections": {
            "executive_profile":           final_state_dict.get("executive_profile"),
            "professional_journey":        final_state_dict.get("professional_journey"),
            "professional_achievements":   final_state_dict.get("professional_achievements"),
            "recent_projects_partnerships": final_state_dict.get("recent_projects_partnerships"),
            "speaks_or_writes":            final_state_dict.get("speaks_or_writes"),
            "events_networking":           final_state_dict.get("events_networking"),
            "skills_expertise":            final_state_dict.get("skills_expertise"),
            "personality_analysis":        final_state_dict.get("personality_analysis"),
            "online_presence":             final_state_dict.get("online_presence"),
            "social_content_summary":      final_state_dict.get("social_content_summary"),
            "social_post_intelligence":    final_state_dict.get("social_post_intelligence"),
            "network_influence":           final_state_dict.get("network_influence"),
            "how_to_engage":               final_state_dict.get("how_to_engage"),
            "red_flags":                   final_state_dict.get("red_flags"),
            "analyst_verdict":             final_state_dict.get("analyst_verdict"),
        },
        "errors": final_state_dict.get("errors", []),
        "full_state": final_state_dict
    }
