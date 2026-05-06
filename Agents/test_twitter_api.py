import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()

def test_twitter_resolution(handle):
    api_key = os.getenv("RAPID_API_KEY")
    clean_handle = handle.strip().lstrip("@").split("/")[-1]
    
    print(f"Resolving: @{clean_handle}")
    
    url = "https://twitter241.p.rapidapi.com/user"
    headers = {
        "x-rapidapi-key": api_key,
        "x-rapidapi-host": "twitter241.p.rapidapi.com",
    }
    params = {"username": clean_handle}
    
    try:
        res = requests.get(url, headers=headers, params=params, timeout=10)
        data = res.json()
        print("Resolution FULL Response Snapshot:", json.dumps(data, indent=2))
        
        result_node = data.get("result") or {}
        data_node = result_node.get("data") or {}
        user_node = data_node.get("user") or {}
        user_result = user_node.get("result") or {}
        
        user_id = user_result.get("rest_id")
        return user_id
    except Exception as e:
        print(f"Resolution Failed: {e}")
        return None

def test_twitter_details(user_id):
    if not user_id: return
    
    print(f"\nFetching details for ID: {user_id}")
    api_key = os.getenv("RAPID_API_KEY")
    url = "https://twitter241.p.rapidapi.com/get-users-v2"
    headers = {
        "x-rapidapi-key": api_key,
        "x-rapidapi-host": "twitter241.p.rapidapi.com",
    }
    params = {"users": user_id}
    
    try:
        res = requests.get(url, headers=headers, params=params, timeout=10)
        data = res.json()
        print("Details Raw Response Snapshot:", json.dumps(data, indent=2)[:500])
        return data
    except Exception as e:
        print(f"Details Fetch Failed: {e}")
        return None

def test_twitter_posts(user_id):
    if not user_id: return
    
    print(f"\nFetching posts for ID: {user_id}")
    api_key = os.getenv("RAPID_API_KEY")
    url = "https://twitter241.p.rapidapi.com/user-tweets"
    headers = {
        "x-rapidapi-key": api_key,
        "x-rapidapi-host": "twitter241.p.rapidapi.com",
    }
    params = {"user": user_id, "count": "5"}
    
    try:
        res = requests.get(url, headers=headers, params=params, timeout=10)
        data = res.json()
        print("Posts Raw Response Snapshot:", json.dumps(data, indent=2)[:500])
        return data
    except Exception as e:
        print(f"Posts Fetch Failed: {e}")
        return None

if __name__ == "__main__":
    uid = test_twitter_resolution("sundarpichai")
    test_twitter_details(uid)
    test_twitter_posts(uid)
