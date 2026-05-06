from pydantic import BaseModel
from typing import Optional, List, Annotated, Dict, Any
from operator import add


def replace_list(left: List, right: List) -> List:
    """
    Reducer for lists that replaces the entire list instead of appending.
    This ensures nodes that return lists completely replace the state.
    """
    if right is not None:
        return right
    return left


class LinkedinPostState(BaseModel):
    type: str                          # "post" or "repost"
    is_activity: Optional[bool] = None
    url: Optional[str] = None
    text: str                          # main post text (or reshared text if repost)
    num_shares: int = 0
    num_likes: int = 0
    num_comments: int = 0
    comments_count: int = 0            # len(comments array)
    reactions_count: int = 0           # len(reactions array)
    posted_at: Optional[str] = None
    actor_name: Optional[str] = None
    actor_profile_url: Optional[str] = None
    post_type: Optional[str] = None     # raw media type: "image", "text", "linkedinVideo", etc.


class LinkedInState(BaseModel):
    # --- Identity ---
    url: Optional[str] = None
    username: Optional[str] = None
    linkedin_id: Optional[str] = None
    raw_data: Optional[Dict[str, Any]] = None
    posts: Optional[List[LinkedinPostState]] = None

    # --- Basic Info ---
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    full_name: Optional[str] = None
    headline: Optional[str] = None
    is_influencer: Optional[bool] = None
    is_premium: Optional[bool] = None
    is_memorialized: Optional[bool] = None

    # --- Location ---
    location: Optional[str] = None
    location_raw: Optional[str] = None        # linkedinText fallback
    country_full: Optional[str] = None
    state: Optional[str] = None
    city: Optional[str] = None

    # --- Profile Media ---
    profile_picture_url: Optional[str] = None

    # --- Stats ---
    top_skills: Optional[List[str]] = None
    followers_count: Optional[int] = None
    linkedin_followers: Optional[int] = None
    connections_count: Optional[int] = None

    # --- About ---
    about: Optional[str] = None

    # --- Current Positions ---
    current_positions: Optional[List[Dict[str, Any]]] = None
    # Each item: { company_name, company_linkedin_url, date_range: {start, end} }

    # --- Experience ---
    experiences: Optional[List[Dict[str, Any]]] = None
    # Each item: { position, company_name, duration, description, skills,
    #              start_date, end_date, company_logo_url }

    # --- Education ---
    educations: Optional[List[Dict[str, Any]]] = None
    # Each item: { school_name, school_linkedin_url, degree, field_of_study,
    #              skills, start_date, end_date, school_logo_url }

    # --- Skills & Languages ---
    skills: Optional[List[str]] = None
    languages: Optional[List[str]] = None

    # --- Enrichment ---
    certifications: Optional[List[Dict[str, Any]]] = None
    projects: Optional[List[Dict[str, Any]]] = None
    volunteering: Optional[List[Dict[str, Any]]] = None
    recommendations: Optional[List[Dict[str, Any]]] = None
    publications: Optional[List[Dict[str, Any]]] = None
    courses: Optional[List[str]] = None
    patents: Optional[List[Dict[str, Any]]] = None
    honors_awards: Optional[List[Dict[str, Any]]] = None

    # --- Extras ---
    causes: Optional[List[str]] = None
    featured: Optional[Any] = None
    interests: Optional[List[str]] = None
    organizations: Optional[List[str]] = None

def merge_linkedin_state(left: Optional[LinkedInState], right: Optional[LinkedInState]) -> Optional[LinkedInState]:
    if left is None:
        return right
    if right is None:
        return left
    
    if isinstance(left, dict):
        left = LinkedInState(**left)
    if isinstance(right, dict):
        right = LinkedInState(**right)
    
    return right



class TweetState(BaseModel):
    id: Optional[str] = None
    text: str
    created_at: Optional[str] = None
    likes: int = 0
    retweets: int = 0
    replies: int = 0
    quotes: int = 0
    bookmarks: int = 0
    views: int = 0
    lang: Optional[str] = None
    is_retweet: bool = False
    is_quote: bool = False


class TwitterState(BaseModel):
    id: str
    name: Optional[str] = None
    username: Optional[str] = None
    description: Optional[str] = None
    followers_count: Optional[int] = None
    normal_followers_count: Optional[int] = None
    fast_followers_count: Optional[int] = None
    friends_count: Optional[int] = None
    favourites_count: Optional[int] = None
    listed_count: Optional[int] = None
    media_count: Optional[int] = None
    statuses_count: Optional[int] = None
    profile_image_url: Optional[str] = None
    url: Optional[str] = None
    is_translator: Optional[bool] = None
    has_custom_timelines: Optional[bool] = None
    follow_request_sent: Optional[bool] = None
    
    # Operational fields (Keep these to avoid breaking the pipeline)
    raw_data: Optional[Dict[str, Any]] = None
    tweets: Optional[List[TweetState]] = None



class WebScrape(BaseModel):
    url: str
    title: Optional[str] = None
    content: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    scraped_at: Optional[str] = None
    error: Optional[str] = None


def merge_twitter_state(left: Optional[TwitterState], right: Optional[TwitterState]) -> Optional[TwitterState]:
    if left is None:
        return right
    if right is None:
        return left
    if isinstance(left, dict):
        left = TwitterState(**left)
    if isinstance(right, dict):
        right = TwitterState(**right)
    return right


class AppState(BaseModel):
    # User-provided identifiers (never overwritten)
    user_provided_name: Optional[str] = None
    user_provided_company: Optional[str] = None
    user_provided_designation: Optional[str] = None
    
    # Profile verification (warnings about wrong person)
    profile_verification: Optional[Dict[str, Any]] = None
    
    linkedin: Annotated[Optional[LinkedInState], merge_linkedin_state] = None
    twitter: Annotated[Optional[TwitterState], merge_twitter_state] = None
    
    # Use replace_list reducer to ensure lists are replaced, not appended
    web_scrapes: Annotated[List[WebScrape], replace_list] = []
    
    # Professional Profile sections
    professional_journey: Optional[str] = None                   
    professional_achievements: Optional[str] = None               
    recent_projects_partnerships: Any = None
    speaks_or_writes: Optional[str] = None                       
    events_networking: Any = None
    personal_life_interests: Optional[str] = None
    personality_analysis: Optional[Dict[str, Any]] = None         
    personal_interests_preferences: Optional[Dict[str, Any]] = None 
    
    # Executive Profile Highlights
    executive_profile: Optional[str] = None                      
    
    # Executive Tag Classification
    executive_tag: Optional[Dict[str, Any]] = None
    
    # Social Media Insights
    social_content_summary: Optional[Dict[str, Any]] = None
    linkedin_content_summary: Optional[Dict[str, Any]] = None
    twitter_content_summary: Optional[Dict[str, Any]] = None     
    
    # Digital Media & News Insights
    digital_media_insights: Optional[Dict[str, Any]] = None
    social_post_intelligence: Optional[Dict[str, Any]] = None
    
    # Control flags - personality analysis requires explicit opt-in
    enable_personality_analysis: bool = False
    
    # Service control flags (True = enabled by default)
    enable_executive_profile: bool = True
    enable_professional_journey: bool = True
    enable_professional_achievements: bool = True
    enable_recent_projects_partnerships: bool = True
    enable_speaks_or_writes: bool = True
    enable_events_networking: bool = True
    enable_personal_life_interests: bool = True
    enable_social_content_summary: bool = True
    enable_linkedin_content_summary: bool = True
    enable_twitter_content_summary: bool = True
    enable_digital_media_insights: bool = True
    
    # RefractOne Sections
    refract_one_personal_interest: Optional[str] = None

    # Red Flags & Analyst Verdict (Added to accommodate the existing nodes in the schema)
    red_flags: Optional[Dict[str, Any]] = None                    
    analyst_verdict: Optional[Dict[str, Any]] = None             
    skills_expertise: Optional[Dict[str, Any]] = None            
    online_presence: Optional[Dict[str, Any]] = None             
    network_influence: Optional[Dict[str, Any]] = None           
    how_to_engage: Optional[Dict[str, Any]] = None               

    # Dynamic progress: number of steps that will actually run for this job
    active_step_count: int = 0
    errors: Annotated[List[str], add] = []

class AppCompareState(BaseModel):
    # Identifiers
    report1_id: str
    report2_id: str
    comparison_id: Optional[str] = None
    user_id: Optional[str] = None
    token: Optional[str] = None
    
    # Pruned Contexts (Extracted from large JSONs)
    persona1_ctx: Optional[Dict[str, Any]] = None
    persona2_ctx: Optional[Dict[str, Any]] = None
    
    # Comparison Analysis Sections
    snapshot: Optional[Dict[str, Any]] = None
    career: Optional[Dict[str, Any]] = None
    skills: Optional[Dict[str, Any]] = None
    behavior: Optional[Dict[str, Any]] = None
    influence: Optional[Dict[str, Any]] = None
    engagement: Optional[Dict[str, Any]] = None
    risk: Optional[Dict[str, Any]] = None
    verdict: Optional[Dict[str, Any]] = None
    
    # Status & Logging
    rag_indexed: Optional[bool] = False
    errors: Annotated[List[str], add] = []
