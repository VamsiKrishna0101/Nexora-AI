import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

def test_json_mode():
    api_key = os.getenv("GEMINI_API_KEY")
    genai.configure(api_key=api_key)
    
    # Use the model name provided by the user
    model_name = "models/gemini-3.1-flash-lite-preview"
    model = genai.GenerativeModel(model_name)
    
    prompt = "Generate a JSON with a key 'message' and value 'Hello from Gemini 3.1!'"
    
    try:
        response = model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        print("Response Text:", response.text)
        data = json.loads(response.text)
        print("Parsed JSON:", data)
        return True
    except Exception as e:
        print("Error during test:", e)
        return False

if __name__ == "__main__":
    test_json_mode()
