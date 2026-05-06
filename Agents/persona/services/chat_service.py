import os
from typing import List, Dict, Any, Optional
from persona.services.rag_service import RagService
from persona.services.gemini_service import GeminiService
from persona.prompts.prompt import PERSONA_CHAT_PROMPT

class PersonaChatService:
    def __init__(self):
        self.rag_service = RagService()
        self.gemini = GeminiService()

    async def answer_question(self, report_id: str, question: str) -> Dict[str, Any]:
        """
        Answers a user's custom question about a persona by retrieving context from 
        the specific report namespace in Pinecone.
        """
        try:
            # 1. Retrieve Context from Pinecone using report_id as Namespace
            print(f"[ChatService] Querying RAG for report_id: {report_id}...")
            matches = self.rag_service.query(
                query_text=question,
                top_k=7,
                namespace=report_id
            )

            if not matches:
                return {
                    "answer": "I don't have enough evidence in the current report to answer that.",
                    "sources": []
                }

            # 2. Format Context
            context_blocks = []
            sources = []
            for match in matches:
                metadata = match.get("metadata", {})
                content = match.get("content", "")
                
                # Build context string
                source_info = f"Source: {metadata.get('type', 'Unknown')} | Person: {metadata.get('person', 'Unknown')}"
                context_blocks.append(f"[{source_info}]\n{content}")
                
                # Track sources for the final response
                sources.append({
                    "id": match.get("id"),
                    "type": metadata.get("type"),
                    "content": content[:100] + "..." if len(content) > 100 else content
                })

            full_context = "\n\n".join(context_blocks)

            # 3. Generate Answer using Gemini
            print(f"[ChatService] Generating answer via Gemini...")
            prompt = PERSONA_CHAT_PROMPT.format(
                context=full_context,
                question=question
            )

            answer = await self.gemini.generate_text(prompt)

            return {
                "answer": answer,
                "sources": sources
            }

        except Exception as e:
            print(f"[ChatService] Error: {str(e)}")
            return {
                "error": str(e),
                "answer": "An error occurred while trying to answer your question."
            }
