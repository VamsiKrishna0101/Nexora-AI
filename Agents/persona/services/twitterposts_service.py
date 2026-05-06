import os
import requests
from typing import List, Dict, Any, Optional


class TwitterPostsService:

    BASE_URL = "https://twitter241.p.rapidapi.com/user-tweets"

    def __init__(self):
        api_key = os.getenv("RAPID_API_KEY")
        if not api_key:
            raise ValueError("RAPID_API_KEY environment variable is not set.")
        self.headers = {
            "x-rapidapi-key": api_key,
            "x-rapidapi-host": "twitter241.p.rapidapi.com",
            "Content-Type": "application/json",
        }

    def get_user_tweets(self, user_id: str, count: int = 20) -> List[Dict[str, Any]]:
        try:
            response = requests.get(
                self.BASE_URL,
                headers=self.headers,
                params={"user": user_id, "count": str(count)},
            )
            response.raise_for_status()
            data = response.json()
            return self.extract_tweets(data)
        except Exception as e:
            print(f"[TwitterPostsService] Error: {e}")
            return []

    def extract_tweets(self, data: dict) -> List[Dict[str, Any]]:
        tweets = []
        try:
            instructions = (
                data.get("result", {})
                    .get("timeline", {})
                    .get("instructions", [])
            )
        except Exception:
            return []

        for instruction in instructions:
            entries = instruction.get("entries", [])
            for entry in entries:
                content = entry.get("content", {})
                typename = content.get("__typename", "")
                entry_type = content.get("entryType", "")

                # skip cursors and who-to-follow
                if "Cursor" in entry_type or "Cursor" in typename:
                    continue
                if content.get("displayType") == "Carousel":
                    continue

                # single tweet entry
                if typename == "TimelineTimelineItem":
                    tweet = self.map_tweet_result(
                        content.get("itemContent", {})
                              .get("tweet_results", {})
                              .get("result", {})
                    )
                    if tweet:
                        tweets.append(tweet)

                # threaded / conversation entry
                elif typename == "TimelineTimelineModule":
                    for item in content.get("items", []):
                        tweet = self.map_tweet_result(
                            item.get("item", {})
                                .get("itemContent", {})
                                .get("tweet_results", {})
                                .get("result", {})
                        )
                        if tweet:
                            tweets.append(tweet)

        return tweets

    def map_tweet_result(self, result: dict) -> Optional[Dict[str, Any]]:
        if not result:
            return None
        try:
            # retweet — use the original tweet's legacy
            retweet = result.get("retweeted_status_result", {}).get("result", {})
            if retweet:
                legacy = retweet.get("legacy", {})
            else:
                legacy = result.get("legacy", {})

            if not legacy:
                return None

            text = legacy.get("full_text", "").strip()
            if not text:
                return None

            # append quoted tweet text for context
            quoted = result.get("quoted_status_result", {}).get("result", {})
            if quoted:
                quoted_text = quoted.get("legacy", {}).get("full_text", "").strip()
                if quoted_text:
                    text = f"{text}\n\n[Quoted]: {quoted_text}"

            # append note tweet (long-form expanded text)
            note = result.get("note_tweet", {}) \
                         .get("note_tweet_results", {}) \
                         .get("result", {})
            if note:
                note_text = note.get("text", "").strip()
                if note_text and note_text not in text:
                    text = note_text

            return {
                "id": legacy.get("id_str"),
                "text": text,
                "created_at": legacy.get("created_at"),
                "likes": legacy.get("favorite_count", 0),
                "retweets": legacy.get("retweet_count", 0),
                "replies": legacy.get("reply_count", 0),
                "quotes": legacy.get("quote_count", 0),
                "bookmarks": legacy.get("bookmark_count", 0),
                "views": int(result.get("views", {}).get("count", 0) or 0),
                "lang": legacy.get("lang"),
                "is_retweet": bool(retweet),
                "is_quote": legacy.get("is_quote_status", False),
            }
        except Exception:
            return None