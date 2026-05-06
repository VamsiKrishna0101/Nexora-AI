import os
import json
import itertools
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

class GroqService:
    MODEL = "llama-3.3-70b-versatile"

    SYSTEM_PROMPT = (
        "You are an elite executive intelligence analyst. "
        "You produce precise, evidence-based persona profiles used by enterprise sales teams, investors, and C-suite executives. "
        "Every claim you make must be grounded in the data provided. "
        "You NEVER hallucinate facts. If data is missing, you state it explicitly. "
        "You output ONLY valid JSON — no markdown fences, no preamble, no explanation."
    )

    def __init__(self):
        raw_keys = [
            os.getenv("GROQ_API_KEY", ""),
            os.getenv("GROQ_API_KEY1", ""),
            os.getenv("GROQ_API_KEY2", ""),
            os.getenv("GROQ_API_KEY3", ""),
        ]
        self.api_keys = [k.strip() for k in raw_keys if k.strip()]
        if not self.api_keys:
            raise ValueError("No GROQ API keys found.")
        self._key_cycle = itertools.cycle(self.api_keys)
        print(f"[PersonaGroqService] {len(self.api_keys)} key(s) loaded. Model: {self.MODEL}")

    def _get_client(self) -> Groq:
        return Groq(api_key=next(self._key_cycle))

    def generate_section(self, prompt: str, max_tokens: int = 2000) -> dict:
        """Calls Groq and parses the JSON response, with key rotation fallback."""
        last_error = None
        for attempt in range(len(self.api_keys)):
            client = self._get_client()
            try:
                response = client.chat.completions.create(
                    model=self.MODEL,
                    messages=[
                        {"role": "system", "content": self.SYSTEM_PROMPT},
                        {"role": "user", "content": prompt},
                    ],
                    temperature=0.1,
                    max_tokens=max_tokens,
                )
                raw = response.choices[0].message.content
                # Robustly extract JSON even if the model adds any extra text
                start = raw.find("{")
                end = raw.rfind("}") + 1
                if start == -1 or end == 0:
                    raise ValueError("No JSON object found in response.")
                return json.loads(raw[start:end])
            except Exception as e:
                last_error = e
                print(f"[PersonaGroqService] Attempt {attempt + 1} failed: {e}")
                continue
        raise Exception(f"All GROQ keys failed. Last error: {last_error}")