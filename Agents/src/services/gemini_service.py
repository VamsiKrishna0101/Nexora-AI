import os
import json
import asyncio
from google import genai
from google.genai import types
from typing import Dict, Any, Optional
from dotenv import load_dotenv

load_dotenv()

class GeminiService:
    _instance = None
    _client = None

    def __init__(self, model_name: str = "gemini-3.1-flash-lite-preview"):
        if GeminiService._client is None:
            api_key = os.getenv("GEMINI_API_KEY")
            if not api_key:
                raise ValueError("GEMINI_API_KEY not found in environment variables")
            
            # Instantiate the heavy client only once
            print(f"[GeminiService] Initializing global genai client...")
            GeminiService._client = genai.Client(api_key=api_key)
            
        self.client = GeminiService._client
        # Handle the "models/" prefix if present in user's string
        self.model_name = model_name.replace("models/", "")
        self.log_dir: Optional[str] = None

    def set_log_dir(self, directory: str):
        """Sets the directory where prompts and responses will be saved."""
        self.log_dir = directory
        if not os.path.exists(directory):
            os.makedirs(directory, exist_ok=True)

    def _log_interaction(self, section_id: str, prompt: str, response_text: str, error: Optional[str] = None):
        """Helper to save interaction to the log directory."""
        if not self.log_dir:
            return

        try:
            # Save Prompt
            prompt_file = os.path.join(self.log_dir, f"{section_id}_prompt.txt")
            with open(prompt_file, "w", encoding="utf-8") as f:
                f.write(prompt)

            # Save Response
            response_file = os.path.join(self.log_dir, f"{section_id}_response.json")
            with open(response_file, "w", encoding="utf-8") as f:
                if error:
                    json.dump({"error": error, "raw_response": response_text}, f, indent=2)
                else:
                    try:
                        data = json.loads(response_text)
                        json.dump(data, f, indent=2)
                    except:
                        f.write(response_text)
                        
        except Exception as e:
            print(f"Logging Error: {e}")

    def generate_json_sync(self, prompt: str, section_id: str = "unknown", system_instruction: Optional[str] = None) -> Dict[str, Any]:
        """Synchronous generation using the new google-genai SDK."""
        try:
            config = types.GenerateContentConfig(
                response_mime_type="application/json",
                system_instruction=system_instruction
            )
            
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=config
            )
            
            res_text = response.text
            self._log_interaction(section_id, f"SYSTEM: {system_instruction}\n\nUSER: {prompt}", res_text)
            
            return json.loads(res_text)
        except Exception as e:
            print(f"Gemini (GenAI) Sync Error [{section_id}]: {e}")
            self._log_interaction(section_id, prompt, "NO_TEXT", error=str(e))
            return {"error": str(e), "success": False}

    async def generate_json(self, prompt: str, section_id: str = "unknown", system_instruction: Optional[str] = None) -> Dict[str, Any]:
        """Async version (runs the sync call in a thread pool) for JSON."""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            None, 
            lambda: self.generate_json_sync(prompt, section_id, system_instruction)
        )

    def generate_text_sync(self, prompt: str, system_instruction: Optional[str] = None) -> str:
        """Synchronous text generation (non-JSON)."""
        try:
            config = types.GenerateContentConfig(
                system_instruction=system_instruction
            )
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=config
            )
            return response.text
        except Exception as e:
            print(f"Gemini Text Generation Error: {e}")
            return f"Error: {str(e)}"

    async def generate_text(self, prompt: str, system_instruction: Optional[str] = None) -> str:
        """Async text generation (non-JSON)."""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            None, 
            lambda: self.generate_text_sync(prompt, system_instruction)
        )

    def generate_section(self, prompt: str) -> str:
        """Helper for section generation (compatibility with existing code)."""
        return self.generate_text_sync(prompt)

    def generate_aggregate(self, prompt: str) -> str:
        """Helper for aggregate generation (compatibility with existing code)."""
        return self.generate_text_sync(prompt)
