import os
import json
from typing import Optional
from dataclasses import dataclass, field
from apify_client import ApifyClient
from src.state import LinkedinPostState




@dataclass
class LinkedinPostsResult:
    success: bool
    data: list[LinkedinPostState] = field(default_factory=list)


class LinkedinPostsService:

    ACTOR_ID = "Wpp1BZ6yGWjySadk3"

    def __init__(self):
        token = os.environ.get("APIFY_TOKEN")
        if not token:
            raise ValueError("APIFY_TOKEN environment variable is not set.")
        self.client = ApifyClient(token=token)

    def get_company_posts(
        self,
        linkedin_url: str,
        max_posts: int = 6,
    ) -> LinkedinPostsResult:
        try:
            normalized_url = linkedin_url.rstrip("/")

            run = self.client.actor(self.ACTOR_ID).call(run_input={
                "urls": [normalized_url],
                "limitPerSource": max_posts,
                "deepScrape": True,
                "rawData": False,
            })

            items = list(self.client.dataset(run["defaultDatasetId"]).iterate_items())

            print(f"[LinkedinPostsService] Raw count: {len(items)}")
            if items:
                print(f"[LinkedinPostsService] Sample keys: {list(items[0].keys())}")

            data = [
                self.map_post(item)
                for item in items
            ]

            return LinkedinPostsResult(success=True, data=data)

        except Exception as e:
            print(f"[LinkedinPostsService] Error: {e}")
            return LinkedinPostsResult(success=False, data=[])

    def map_post(self, item: dict) -> LinkedinPostState:
        reshared = item.get("resharedPost")
        is_repost = isinstance(reshared, dict) and bool(reshared)

        # If repost: use reshared post's text; otherwise use main text
        if is_repost:
            text = reshared.get("text", "") or ""
            post_kind = "repost"
        else:
            text = item.get("text", "") or ""
            post_kind = "post"

        author = item.get("author", {}) or {}
        first = (author.get("firstName") or "").strip()
        last = (author.get("lastName") or "").strip()
        full_name = f"{first} {last}".strip() or None

        comments_list = item.get("comments") or []
        reactions_list = item.get("reactions") or []

        return LinkedinPostState(
            type=post_kind,
            is_activity=item.get("isActivity"),
            url=item.get("url"),
            text=text.strip(),
            num_shares=item.get("numShares") or 0,
            num_likes=item.get("numLikes") or 0,
            num_comments=item.get("numComments") or 0,
            comments_count=len(comments_list),
            reactions_count=len(reactions_list),
            posted_at=item.get("postedAtISO") or item.get("timeSincePosted"),
            actor_name=item.get("authorName") or full_name,
            actor_profile_url=item.get("authorProfileUrl"),
            post_type=item.get("type"),
        )
