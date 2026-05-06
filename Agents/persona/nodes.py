import os
import datetime
from typing import Dict, Any, List

from persona.services.identity_service import IdentityService
from persona.services.professional_background_service import ProfessionalBackgroundService
from persona.services.skills_expertise_service import SkillsExpertiseService
from persona.services.personality_service import PersonalityService
from persona.services.online_presence_service import OnlinePresenceService
from persona.services.content_thought_leadership_service import ContentThoughtLeadershipService
from persona.services.network_influence_service import NetworkInfluenceService
from persona.services.how_to_engage_service import HowToEngageService
from persona.services.achievements_service import AchievementsService
from persona.services.red_flags_service import RedFlagsService
from persona.services.analyst_verdict_service import AnalystVerdictService
from persona.services.social_post_intelligence_service import SocialPostIntelligenceService
from src.state import AppState

class PersonaNodes:
    def __init__(self):
        self.s01 = IdentityService()
        self.s02 = ProfessionalBackgroundService()
        self.s03 = SkillsExpertiseService()
        self.s04 = PersonalityService()
        self.s05 = OnlinePresenceService()
        self.s06 = ContentThoughtLeadershipService()
        self.s07 = NetworkInfluenceService()
        self.s08 = HowToEngageService()
        self.s09 = AchievementsService()
        self.s10 = RedFlagsService()
        self.s11 = AnalystVerdictService()
        self.s12 = SocialPostIntelligenceService()
        self.log_dir_initialized = False

    def _setup_logging(self, state: AppState):
        """Creates a timestamped folder for this specific run."""
        if self.log_dir_initialized:
            return
            
        name = state.user_provided_name or "Unknown"
        name = name.replace(" ", "_")
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        log_dir = os.path.join("logs", "persona_runs", f"{name}_{timestamp}")
        
        # Apply this log dir to all services
        for service in [self.s01, self.s02, self.s03, self.s04, self.s05, 
                        self.s06, self.s07, self.s08, self.s09, self.s10, self.s11, self.s12]:
            if hasattr(service, "gemini"):
                service.gemini.set_log_dir(log_dir)
        
        self.log_dir_initialized = True
        print(f"Logging this run to: {log_dir}")

    # ---- PARALLEL NODES ----
    def identity_node(self, state: AppState):
        try:
            self._setup_logging(state)
            li_data = state.linkedin.raw_data if state.linkedin else None
            tw_data = state.twitter.raw_data if state.twitter else None
            # S01 -> executive_profile
            return {"executive_profile": str(self.s01.generate(
                linkedin_data=li_data,
                twitter_data=tw_data,
            ))}
        except Exception as e:
            return {"executive_profile": None, "errors": [f"S01 failed: {e}"]}

    def professional_background_node(self, state: AppState):
        try:
            self._setup_logging(state)
            li_data = state.linkedin.raw_data if state.linkedin else None
            # S02 -> professional_journey
            return {"professional_journey": str(self.s02.generate(
                linkedin_data=li_data,
            ))}
        except Exception as e:
            return {"professional_journey": None, "errors": [f"S02 failed: {e}"]}

    def skills_expertise_node(self, state: AppState):
        try:
            self._setup_logging(state)
            li_data = state.linkedin.raw_data if state.linkedin else None
            li_posts = state.linkedin.posts if state.linkedin else []
            # S03 -> skills_expertise
            return {"skills_expertise": self.s03.generate(
                linkedin_data=li_data,
                linkedin_posts=li_posts,
            )}
        except Exception as e:
            return {"skills_expertise": None, "errors": [f"S03 failed: {e}"]}

    def personality_node(self, state: AppState):
        try:
            self._setup_logging(state)
            li_posts = state.linkedin.posts if state.linkedin else []
            tw_posts = state.twitter.tweets if state.twitter else []
            about = state.linkedin.about if state.linkedin else ""
            # S04 -> personality_analysis
            return {"personality_analysis": self.s04.generate(
                linkedin_posts=li_posts,
                twitter_posts=tw_posts,
                about_section=about,
            )}
        except Exception as e:
            return {"personality_analysis": None, "errors": [f"S04 failed: {e}"]}

    def online_presence_node(self, state: AppState):
        try:
            self._setup_logging(state)
            li_data = state.linkedin.raw_data if state.linkedin else None
            li_posts = state.linkedin.posts if state.linkedin else []
            tw_data = state.twitter.raw_data if state.twitter else None
            tw_posts = state.twitter.tweets if state.twitter else []
            
            # Combine all web scrapes into a single snippets string
            web_snippets = "\n\n".join([f"--- {s.url} ---\n{s.content}" for s in state.web_scrapes if s.content])
            
            # S05 -> online_presence
            return {"online_presence": self.s05.generate(
                linkedin_data=li_data,
                linkedin_posts=li_posts,
                twitter_data=tw_data,
                twitter_posts=tw_posts,
                web_snippets=web_snippets,
            )}
        except Exception as e:
            return {"online_presence": None, "errors": [f"S05 failed: {e}"]}

    def content_thought_leadership_node(self, state: AppState):
        try:
            self._setup_logging(state)
            li_posts = state.linkedin.posts if state.linkedin else []
            tw_posts = state.twitter.tweets if state.twitter else []
            web_snippets = "\n\n".join([f"--- {s.url} ---\n{s.content}" for s in state.web_scrapes if s.content])
            # S06 -> speaks_or_writes and social_content_summary
            res = self.s06.generate(
                web_snippets=web_snippets,
                linkedin_posts=li_posts,
                twitter_posts=tw_posts,
            )
            return {
                "speaks_or_writes": str(res),
                "social_content_summary": {"raw": res}
            }
        except Exception as e:
            return {"speaks_or_writes": None, "errors": [f"S06 failed: {e}"]}

    def network_influence_node(self, state: AppState):
        try:
            self._setup_logging(state)
            li_data = state.linkedin.raw_data if state.linkedin else None
            web_snippets = "\n\n".join([f"--- {s.url} ---\n{s.content}" for s in state.web_scrapes if s.content])
            # S07 -> events_networking and network_influence
            res = self.s07.generate(
                linkedin_data=li_data,
                web_snippets=web_snippets,
            )
            return {
                "events_networking": str(res),
                "network_influence": res
            }
        except Exception as e:
            return {"events_networking": None, "errors": [f"S07 failed: {e}"]}

    def achievements_node(self, state: AppState):
        try:
            self._setup_logging(state)
            li_data = state.linkedin.raw_data if state.linkedin else None
            web_snippets = "\n\n".join([f"--- {s.url} ---\n{s.content}" for s in state.web_scrapes if s.content])
            # S09 -> professional_achievements and recent_projects_partnerships
            res = self.s09.generate(
                linkedin_data=li_data,
                web_snippets=web_snippets,
            )
            return {
                "professional_achievements": str(res),
                "recent_projects_partnerships": res
            }
        except Exception as e:
            return {"professional_achievements": None, "errors": [f"S09 failed: {e}"]}

    def red_flags_node(self, state: AppState):
        try:
            self._setup_logging(state)
            li_data = state.linkedin.raw_data if state.linkedin else None
            tw_posts = state.twitter.tweets if state.twitter else []
            web_snippets = "\n\n".join([f"--- {s.url} ---\n{s.content}" for s in state.web_scrapes if s.content])
            # S10 -> red_flags
            return {"red_flags": self.s10.generate(
                linkedin_data=li_data,
                web_snippets=web_snippets,
                twitter_posts=tw_posts,
            )}
        except Exception as e:
            return {"red_flags": None, "errors": [f"S10 failed: {e}"]}
    def social_post_intelligence_node(self, state: AppState):
        try:
            self._setup_logging(state)
            li_posts = state.linkedin.posts if state.linkedin else []
            tw_posts = state.twitter.tweets if state.twitter else []
            # S12 -> social_post_intelligence
            return {"social_post_intelligence": self.s12.generate(
                linkedin_posts=li_posts,
                twitter_posts=tw_posts,
            )}
        except Exception as e:
            return {"social_post_intelligence": None, "errors": [f"S12 failed: {e}"]}

    # ---- SEQUENTIAL NODE ----
    def how_to_engage_node(self, state: AppState):
        try:
            self._setup_logging(state)
            li_posts = state.linkedin.posts if state.linkedin else []
            tw_posts = state.twitter.tweets if state.twitter else []
            # S08 -> how_to_engage
            return {"how_to_engage": self.s08.generate(
                personality_section=state.personality_analysis,
                linkedin_posts=li_posts,
                twitter_posts=tw_posts,
            )}
        except Exception as e:
            return {"how_to_engage": None, "errors": [f"S08 failed: {e}"]}

    # ---- FINAL NODE ----
    def analyst_verdict_node(self, state: AppState):
        try:
            self._setup_logging(state)
            all_sections = [
                s for s in [
                   state.executive_profile, state.professional_journey,
                   state.skills_expertise, state.personality_analysis,
                   state.online_presence, state.social_content_summary,
                   state.network_influence, state.how_to_engage,
                   state.professional_achievements, state.red_flags,
                   state.social_post_intelligence
                ]
                if s is not None
            ]
            # S11 -> analyst_verdict
            return {"analyst_verdict": self.s11.generate(all_sections=all_sections)}
        except Exception as e:
            return {"analyst_verdict": None, "errors": [f"S11 failed: {e}"]}
