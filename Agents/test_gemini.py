import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure the API key
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("Error: GEMINI_API_KEY not found in .env")
    exit(1)

genai.configure(api_key=api_key)

# The exact model name for Gemini 2.1 Flash Lite
model_name = "models/gemini-3.1-flash-lite-preview"

try:
    print(f"Testing model: {model_name}...")
    model = genai.GenerativeModel(model_name)
    
    response = model.generate_content("Hello! Can you confirm you are Gemini 2.0 Flash Lite? Also, tell me a very short joke about AI.")
    
    print("\n--- Response ---")
    print(response.text)
    print("----------------")
    print("\n✅ Verification Successful!")

except Exception as e:
    print(f"\n❌ Error during verification: {e}")
    print("\nChecking available models as fallback...")
    try:
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                print(f"- {m.name}")
    except:
        pass
