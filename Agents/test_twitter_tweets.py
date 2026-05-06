import os
import json
from persona.services.twitter_service import TwitterService
from persona.services.twitterposts_service import TwitterPostsService
from src.state import TweetState
from persona.runner import _to_dict
from dotenv import load_dotenv

def test_twitter_tweets():
    load_dotenv()
    ts = TwitterService()
    tps = TwitterPostsService()
    tps = TwitterPostsService()
    user_id = "14130366"  # Sundar Pichai
    
    print(f"Fetching tweets for ID: {user_id}")
    tweets = tps.get_user_tweets(user_id, count=5)
    
    if tweets:
        print(f"Successfully fetched {len(tweets)} tweets.")
        
        # Validate against TweetState
        valid_tweets = []
        for t in tweets:
            try:
                # Pydantic validation
                TweetState(**t)
                valid_tweets.append(t)
            except Exception as e:
                print(f"Validation failed for tweet: {e}")
                print(f"Tweet data: {json.dumps(t, indent=2)}")

        with open("test_twitter_tweets_result.json", "w") as f:
            json.dump(valid_tweets, f, indent=2)
        print("Results saved to test_twitter_tweets_result.json")
    else:
        print("No tweets found or failed to fetch.")

if __name__ == "__main__":
    test_twitter_tweets()
