import os
import json
import requests
from typing import List, Dict, Any, Optional
from apify_client import ApifyClient


class LinkedinService:
    def __init__(self, api_key: Optional[str] = None):
        self.api_token = api_key or os.getenv("APIFY_TOKEN")
        if not self.api_token:
            raise ValueError("APIFY_TOKEN not found in environment variables")
        self.client = ApifyClient(self.api_token)
        self.ACTOR_ID = "LpVuK3Zozwuipa5bp"

    def scrape_profile(self, linkedin_url: str) -> Dict[str, Any]:
        """Fetches a LinkedIn profile using the specified Apify actor."""
        try:
            print(f"[LinkedinService] Scraping profile: {linkedin_url}")

            run_input = {
                "profileScraperMode": "Profile details no email ($4 per 1k)",
                "urls": [linkedin_url],
                "queries": [],
                "publicIdentifiers": [],
                "profileIds": [],
            }

            run = self.client.actor(self.ACTOR_ID).call(run_input=run_input)
            items = list(self.client.dataset(run["defaultDatasetId"]).iterate_items())

            if not items:
                print(f"[LinkedinService] No data found for: {linkedin_url}")
                return {}

            return self.clean_profile(items)

        except Exception as e:
            print(f"[LinkedinService] Scraping failed: {e}")
            return {}

    def _first_logo_url(self, logo: Optional[Dict]) -> Optional[str]:
        """Safely extract the first available logo/photo URL."""
        if not logo:
            return None
        sizes = logo.get("sizes")
        if sizes and isinstance(sizes, list) and len(sizes) > 0:
            return sizes[0].get("url")
        return logo.get("url")

    def clean_profile(self, raw_data: List[Dict]) -> Dict:
        """
        Parses and cleans Apify LinkedIn profile data into the LinkedInState shape.
        """
        if not raw_data or not isinstance(raw_data, list):
            return {}

        p = raw_data[0]

        # ── Location ────────────────────────────────────────────────────────
        location_raw = ""
        country_full = ""
        state_val = ""
        city_val = ""

        loc = p.get("location")
        if isinstance(loc, dict):
            location_raw = loc.get("linkedinText", "") or ""
            parsed = loc.get("parsed") or {}
            country_full = parsed.get("countryFull") or parsed.get("country") or ""
            state_val    = parsed.get("state") or ""
            city_val     = parsed.get("city") or ""
        elif isinstance(loc, str):
            location_raw = loc

        # Fallback: if parsed fields are empty use the raw text
        if not country_full and not state_val and not city_val:
            country_full = location_raw

        # ── Current Positions ────────────────────────────────────────────────
        current_positions = []
        for cp in p.get("currentPosition", []):
            current_positions.append({
                "company_name": cp.get("companyName"),
                "company_linkedin_url": cp.get("companyLinkedinUrl"),
                "date_range": cp.get("dateRange"),
            })

        # ── Experience ───────────────────────────────────────────────────────
        experiences = []
        for exp in p.get("experience", []):
            experiences.append({
                "title": exp.get("position"),
                "company": exp.get("companyName"),
                "duration": exp.get("duration"),
                "description": exp.get("description"),
                "skills": exp.get("skills") or [],
                "start_date": exp.get("startDate"),
                "end_date": exp.get("endDate"),
                "company_logo_url": self._first_logo_url(exp.get("companyLogo")),
            })

        # ── Education ────────────────────────────────────────────────────────
        educations = []
        for edu in p.get("education", []):
            educations.append({
                "institution": edu.get("schoolName"),
                "school_linkedin_url": edu.get("schoolLinkedinUrl"),
                "degree": edu.get("degree"),
                "field_of_study": edu.get("fieldOfStudy"),
                "skills": edu.get("skills") or [],
                "start_date": edu.get("startDate"),
                "end_date": edu.get("endDate"),
                "school_logo_url": self._first_logo_url(edu.get("schoolLogo")),
            })

        # ── Certifications ───────────────────────────────────────────────────
        certifications = []
        for c in p.get("certifications", []):
            certifications.append({
                "name": c.get("name"),
                "issuing_org": c.get("authority") or c.get("issuingOrganization"),
                "issued_date": c.get("timePeriod") or c.get("issuedDate"),
                "credential_url": c.get("url"),
            })

        # ── Projects ─────────────────────────────────────────────────────────
        projects = []
        for proj in p.get("projects", []):
            projects.append({
                "title": proj.get("title"),
                "description": proj.get("description"),
                "url": proj.get("url"),
            })

        # ── Volunteering ─────────────────────────────────────────────────────
        volunteering = []
        for v in p.get("volunteering", []):
            volunteering.append({
                "role": v.get("role"),
                "organization": v.get("companyName") or v.get("organization"),
                "cause": v.get("cause"),
                "description": v.get("description"),
                "start_date": v.get("startDate"),
                "end_date": v.get("endDate"),
            })

        # ── Recommendations ──────────────────────────────────────────────────
        recommendations = []
        for r in p.get("receivedRecommendations", []):
            recommendations.append({
                "recommender_name": r.get("recommenderName") or r.get("name"),
                "text": r.get("text") or r.get("description"),
            })

        # ── Skills ───────────────────────────────────────────────────────────
        skills = [s.get("name") for s in p.get("skills", []) if s.get("name")]

        # ── Top Skills ───────────────────────────────────────────────────────
        top_skills_raw = p.get("topSkills")
        if isinstance(top_skills_raw, list):
            top_skills = [s.get("name") if isinstance(s, dict) else s for s in top_skills_raw]
        else:
            top_skills = []

        # ── Publications ─────────────────────────────────────────────────────
        publications = []
        for pub in p.get("publications", []):
            publications.append({
                "title": pub.get("name") or pub.get("title"),
                "publisher": pub.get("publisher"),
                "date": pub.get("date") or pub.get("publishedDate"),
                "url": pub.get("url"),
                "description": pub.get("description"),
            })

        # ── Courses ──────────────────────────────────────────────────────────
        courses = [c.get("name") for c in p.get("courses", []) if c.get("name")]

        # ── Patents ──────────────────────────────────────────────────────────
        patents = []
        for pat in p.get("patents", []):
            patents.append({
                "title": pat.get("title"),
                "patent_number": pat.get("patentNumber"),
                "date": pat.get("issueDate") or pat.get("date"),
                "description": pat.get("description"),
                "url": pat.get("url"),
            })

        # ── Honors & Awards ──────────────────────────────────────────────────
        honors_awards = []
        for h in p.get("honorsAndAwards", []):
            honors_awards.append({
                "title": h.get("title"),
                "issuer": h.get("issuer"),
                "date": h.get("issueDate") or h.get("date"),
                "description": h.get("description"),
            })

        # ── Languages ────────────────────────────────────────────────────────
        languages = [lang.get("name") for lang in p.get("languages", []) if lang.get("name")]

        # ── Causes ───────────────────────────────────────────────────────────
        causes_raw = p.get("causes", [])
        causes = [c if isinstance(c, str) else c.get("name", "") for c in causes_raw]

        # ── Featured ─────────────────────────────────────────────────────────
        featured = p.get("featured")

        # ── Profile picture ──────────────────────────────────────────────────
        profile_pic = p.get("photo") or self._first_logo_url(p.get("profilePicture"))

        first_name = (p.get("firstName") or "").strip()
        last_name  = (p.get("lastName") or "").strip()

        return {
            # Identity
            "url": p.get("linkedinUrl"),
            "username": p.get("publicIdentifier"),
            "linkedin_id": p.get("id"),

            # Basic info
            "first_name": first_name,
            "last_name": last_name,
            "full_name": f"{first_name} {last_name}".strip(),
            "headline": p.get("headline"),
            "is_influencer": p.get("influencer"),
            "is_premium": p.get("premium"),
            "is_memorialized": p.get("memorialized"),

            # Location
            "location": f"{city_val}, {state_val}, {country_full}".strip(", "),
            "location_raw": location_raw,
            "country_full": country_full,
            "state": state_val,
            "city": city_val,

            # Media
            "profile_picture_url": profile_pic,

            # Stats
            "top_skills": top_skills,
            "linkedin_followers": p.get("followerCount"),
            "connections_count": p.get("connectionsCount"),

            # Content
            "about": p.get("about"),
            "current_positions": current_positions,
            "experiences": experiences,
            "educations": educations,
            "skills": skills,
            "languages": languages,
            "certifications": certifications,
            "projects": projects,
            "volunteering": volunteering,
            "recommendations": recommendations,
            "publications": publications,
            "courses": courses,
            "patents": patents,
            "honors_awards": honors_awards,
            "causes": causes,
            "featured": featured,
        }