import os
import requests
from typing import List, Union
from dotenv import load_dotenv

load_dotenv()

class CloudflareEmbeddings:
    def __init__(self, model: str = "@cf/google/embeddinggemma-300m"):
        self.account_id = os.getenv("CF_ACCOUNT_ID")
        self.api_token = os.getenv("CF_API_TOKEN")
        self.model = model
        
        if not self.account_id or not self.api_token:
            raise ValueError("Missing CF_ACCOUNT_ID or CF_API_TOKEN in environment variables")
        
        self.base_url = f"https://api.cloudflare.com/client/v4/accounts/{self.account_id}/ai/run"
        self.headers = {
            "Authorization": f"Bearer {self.api_token}",
            "Content-Type": "application/json"
        }

    def embed_query(self, text: str) -> List[float]:
        """Generate embedding for a single text (for queries)"""
        payload = {"text": text}
        response = requests.post(
            f"{self.base_url}/{self.model}",
            json=payload,
            headers=self.headers
        )
        response.raise_for_status()
        result = response.json()
        
        if result.get("success"):
            return result["result"]["data"][0]   # Returns list of floats
        else:
            raise Exception(f"Cloudflare API Error: {result.get('errors')}")

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for multiple texts (for documents)"""
        payload = {"text": texts}
        response = requests.post(
            f"{self.base_url}/{self.model}",
            json=payload,
            headers=self.headers
        )
        response.raise_for_status()
        result = response.json()
        
        if result.get("success"):
            return result["result"]["data"]   # List of embedding vectors
        else:
            raise Exception(f"Cloudflare API Error: {result.get('errors')}")


# ====================== Usage Example ======================

if __name__ == "__main__":
    embeddings = CloudflareEmbeddings(model="@cf/google/embeddinggemma-300m")
    
    # Single query embedding
    query_emb = embeddings.embed_query("What is multi-agent system?")
    print("Query embedding dimension:", len(query_emb))
    
    # Multiple documents
    docs = [
        "LangGraph is a library for building multi-agent workflows.",
        "Cloudflare Workers AI runs models at the edge with low latency."
    ]
    doc_embeddings = embeddings.embed_documents(docs)
    print("Number of document embeddings:", len(doc_embeddings))