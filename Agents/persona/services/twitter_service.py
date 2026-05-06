import os
import requests
from typing import Optional
from dataclasses import dataclass, field
@dataclass
class TwitterUser:
    id: str
    name: Optional[str]
    username: Optional[str]
    description: Optional[str]
    followers_count: Optional[int]
    normal_followers_count: Optional[int]
    fast_followers_count: Optional[int]
    friends_count: Optional[int]
    favourites_count: Optional[int]
    listed_count: Optional[int]
    media_count: Optional[int]
    statuses_count: Optional[int]  # tweet_count
    profile_image_url: Optional[str]
    url: Optional[str]
    is_translator: Optional[bool]
    has_custom_timelines: Optional[bool]
    follow_request_sent: Optional[bool]


class TwitterService:

    BASE_URL = "https://twitter241.p.rapidapi.com"

    def __init__(self):
        self.api_key = os.getenv("RAPID_API_KEY")
        if not self.api_key:
            raise ValueError("RAPID_API_KEY environment variable is not set.")
        self.headers = {
            "x-rapidapi-key": self.api_key,
            "x-rapidapi-host": "twitter241.p.rapidapi.com",
            "Content-Type": "application/json",
        }

    def get_user_by_username(self, username: str) -> Optional[TwitterUser]:
        try:
            clean_username = username.strip().split("/")[-1].lstrip("@")
            response = requests.get(
                f"{self.BASE_URL}/user",
                headers=self.headers,
                params={"username": clean_username},
            )
            response.raise_for_status()
            raw = response.json()
            self._last_raw = raw # Store for debugging
            return self.map_user(self.extract_user_result(raw))
        except Exception as e:
            print(f"[TwitterService] Username lookup failed: {e}")
            return None

    def get_user_by_id(self, user_id: str) -> Optional[TwitterUser]:
        try:
            response = requests.get(
                f"{self.BASE_URL}/get-users-v2",
                headers=self.headers,
                params={"users": user_id},
            )
            response.raise_for_status()
            raw = response.json()
            results = self.extract_user_results(raw)
            return self.map_user(results[0]) if results else None
        except Exception as e:
            print(f"[TwitterService] ID lookup failed: {e}")
            return None

    def extract_user_result(self, raw: dict) -> Optional[dict]:
        try:
            return raw["user"]["result"]
        except (KeyError, TypeError):
            pass
        try:
            return raw["result"]["data"]["user"]["result"]
        except (KeyError, TypeError):
            pass
        return None

    def extract_user_results(self, raw: dict) -> list[dict]:
        try:
            users = raw["result"]["data"]["users"]
            return [u["result"] for u in users if u.get("result")]
        except (KeyError, TypeError):
            pass
        single = self.extract_user_result(raw)
        return [single] if single else []

    def map_user(self, result: Optional[dict]) -> Optional[TwitterUser]:
        if not result:
            return None

        core = result.get("core", {})
        legacy = result.get("legacy", {})
        avatar = result.get("avatar", {})
        location_obj = result.get("location", {})
        professional = result.get("professional", {})
        categories = professional.get("category", [])
        
        screen_name = core.get("screen_name") or legacy.get("screen_name")

        website_url = None
        try:
            website_url = legacy["entities"]["url"]["urls"][0]["expanded_url"]
        except (KeyError, TypeError, IndexError):
            pass

        return TwitterUser(
            id=result.get("rest_id", ""),
            name=core.get("name") or legacy.get("name"),
            username=screen_name,
            description=legacy.get("description"),
            followers_count=legacy.get("followers_count"),
            normal_followers_count=legacy.get("normal_followers_count"),
            fast_followers_count=legacy.get("fast_followers_count"),
            friends_count=legacy.get("friends_count"),
            favourites_count=legacy.get("favourites_count"),
            listed_count=legacy.get("listed_count"),
            media_count=legacy.get("media_count"),
            statuses_count=legacy.get("statuses_count"),
            profile_image_url=avatar.get("image_url") or legacy.get("profile_image_url_https"),
            url=f"https://twitter.com/{screen_name}" if screen_name else None,
            is_translator=legacy.get("is_translator"),
            has_custom_timelines=legacy.get("has_custom_timelines"),
            follow_request_sent=legacy.get("follow_request_sent")
        )