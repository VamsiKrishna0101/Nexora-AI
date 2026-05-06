import os
from typing import List, Dict, Any
from pinecone import Pinecone
from dotenv import load_dotenv

load_dotenv()

class PineconeVectorStore:
    def __init__(self, dimension: int = 768):
        self.api_key = os.getenv("PINECONE_API_KEY")
        self.index_name = os.getenv("PINECONE_INDEX_NAME")

        if not self.api_key or not self.index_name:
            raise ValueError("Missing PINECONE_API_KEY or PINECONE_INDEX_NAME")

        self.pc = Pinecone(api_key=self.api_key)
        self.index = self.pc.Index(self.index_name)
        self.dimension = dimension

    # ======================
    # UPSERT DOCUMENTS
    # ======================
    def upsert_documents(
        self,
        ids: List[str],
        embeddings: List[List[float]],
        metadatas: List[Dict[str, Any]],
        namespace: str = ""
    ):
        vectors = []

        for i in range(len(ids)):
            vectors.append({
                "id": ids[i],
                "values": embeddings[i],
                "metadata": metadatas[i]
            })

        self.index.upsert(vectors=vectors, namespace=namespace)

    # ======================
    # QUERY
    # ======================
    def query(
        self,
        query_embedding: List[float],
        top_k: int = 5,
        filter: Dict[str, Any] = None,
        namespace: str = ""
    ):
        response = self.index.query(
            vector=query_embedding,
            top_k=top_k,
            include_metadata=True,
            filter=filter,
            namespace=namespace
        )
        return response

    # ======================
    # DELETE
    # ======================
    def delete(self, ids: List[str]):
        self.index.delete(ids=ids)