import os
import json
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

def test_new_sdk():
    api_key = os.getenv("GEMINI_API_KEY")
    client = genai.Client(api_key=api_key)
    
    # Model name the user provided
    model_id = "gemini-3.1-flash-lite-preview"
    
    print(f"Testing new SDK with model: {model_id}")
    
    try:
        response = client.models.generate_content(
            model=model_id,
            contents="Say 'Switch complete!' in JSON format with key 'status'",
            config=types.GenerateContentConfig(
                response_mime_type="application/json"
            )
        )
        print("Raw Response:", response.text)
        print("Success!")
        return True
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    test_new_sdk()
