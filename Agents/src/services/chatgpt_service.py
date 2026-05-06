import os
import json
from groq import Groq
from dotenv import load_dotenv
import itertools

load_dotenv()

class GROQService:
    def __init__(self):
        # Load all 4 API keys, filter out empty ones
        raw_keys = [
            os.getenv("GROQ_API_KEY", ""),
            os.getenv("GROQ_API_KEY1", ""),
            os.getenv("GROQ_API_KEY2", ""),
            os.getenv("GROQ_API_KEY3", ""),
        ]
        self.api_keys = [k.strip() for k in raw_keys if k.strip()]
        
        if not self.api_keys:
            raise ValueError("No GROQ API keys found. Set GROQ_API_KEY in .env")
        
        # Build a round-robin iterator over all keys
        self._key_cycle = itertools.cycle(self.api_keys)
        self.model = "llama-3.3-70b-versatile"
        
        print(f"[GROQService] Loaded {len(self.api_keys)} API key(s). Model: {self.model}")

    def _get_client(self) -> Groq:
        """Returns a Groq client using the next key in rotation."""
        key = next(self._key_cycle)
        return Groq(api_key=key)

    def generate_completion(self, prompt: str, max_tokens: int = 2000, temperature: float = 0.2) -> str:
        """
        Generic completion with round-robin key rotation and fallback across all keys.
        Higher max_tokens and lower temperature for high-fidelity intelligence output.
        """
        last_error = None
        
        # Try each key once before giving up
        for attempt in range(len(self.api_keys)):
            client = self._get_client()
            try:
                response = client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {
                            "role": "system",
                            "content": (
                                "You are a senior intelligence analyst trained at Palantir, McKinsey, and Goldman Sachs. "
                                "You produce classified-grade company research briefs for institutional investors and C-suite executives. "
                                "Your output is always: specific, factual, structured, and dense. "
                                "You never use marketing language. Every sentence contains a data point or a specific insight. "
                                "You follow the exact output format specified in the prompt."
                            ),
                        },
                        {
                            "role": "user",
                            "content": prompt,
                        },
                    ],
                    temperature=temperature,
                    max_tokens=max_tokens,
                )
                return response.choices[0].message.content
            except Exception as e:
                last_error = e
                print(f"[GROQService] Key attempt {attempt + 1} failed: {str(e)}")
                continue

        # All keys failed
        raise Exception(f"All GROQ API keys failed. Last error: {str(last_error)}")

    def generate_executive_brief(self, prompt: str) -> str:
        return self.generate_completion(prompt, max_tokens=1000)

    def generate_section(self, prompt: str) -> str:
        return self.generate_completion(prompt, max_tokens=1500)

    def generate_aggregate(self, prompt: str) -> str:
        """For SWOT and Verdict which need to consume longer inputs."""
        return self.generate_completion(prompt, max_tokens=2000, temperature=0.1)

    def generate_json(self, prompt: str) -> dict:
        """JSON-specific generation with strict extraction."""
        try:
            response = self.generate_completion(prompt, max_tokens=1000)
            start = response.find("{")
            end = response.rfind("}")
            if start != -1 and end != -1:
                return json.loads(response[start:end + 1])
            raise ValueError("No valid JSON found in response")
        except Exception as e:
            print(f"[GROQService JSON Error]: {str(e)}")
            raise Exception("Failed to parse JSON response")