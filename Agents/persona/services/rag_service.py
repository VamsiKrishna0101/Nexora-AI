import uuid
from typing import List, Dict, Any, Optional
from persona.services.cloudfareembeddings_service import CloudflareEmbeddings
from persona.services.pinecone_service import PineconeVectorStore

class RagService:
    def __init__(self):
        # Default to the embedding dimension of embeddinggemma-300m (768)
        self.embeddings = CloudflareEmbeddings()
        self.vector_store = PineconeVectorStore(dimension=768)

    def index_texts(self, texts: List[str], metadatas: Optional[List[Dict[str, Any]]] = None, namespace: str = ""):
        """
        Embeds a list of texts and upserts them into Pinecone with an optional namespace.
        """
        if not texts:
            return

        if metadatas is None:
            metadatas = [{} for _ in texts]

        # Generate unique IDs for the vectors
        ids = [str(uuid.uuid4()) for _ in texts]

        # Generate embeddings using Cloudflare
        embeddings_list = self.embeddings.embed_documents(texts)

        # Upsert to Pinecone
        self.vector_store.upsert_documents(ids, embeddings_list, metadatas, namespace=namespace)
        print(f"[RagService] Indexed {len(texts)} documents successfully in namespace: '{namespace}'")

    def index_persona_data(self, persona_name: str, state_dict: Dict[str, Any], final_sections: Dict[str, Any], namespace: str = ""):
        """
        Indexes raw scrapes and final intelligence sections for a persona within a specific namespace.
        """
        texts = []
        metadatas = []

        # 1. Raw LinkedIn Posts
        linkedin = state_dict.get("linkedin") or {}
        posts = linkedin.get("posts") or []
        for p in posts:
            if isinstance(p, dict) and p.get("text"):
                texts.append(p["text"])
                metadatas.append({
                    "person": persona_name,
                    "source": "linkedin",
                    "data_type": "raw_post",
                    "timestamp": p.get("posted_at"),
                    "text": p["text"]
                })

        # 2. Raw Twitter Tweets
        twitter = state_dict.get("twitter") or {}
        tweets = twitter.get("tweets") or []
        for t in tweets:
            if isinstance(t, dict) and t.get("text"):
                texts.append(t["text"])
                metadatas.append({
                    "person": persona_name,
                    "source": "twitter",
                    "data_type": "raw_tweet",
                    "timestamp": t.get("created_at"),
                    "text": t["text"]
                })

        # 3. Web Research Snippets
        web_scrapes = state_dict.get("web_scrapes") or []
        for ws in web_scrapes:
            if isinstance(ws, dict) and ws.get("content"):
                texts.append(ws["content"])
                metadatas.append({
                    "person": persona_name,
                    "source": "web_research",
                    "data_type": "raw_research",
                    "text": ws["content"]
                })

        # 4. Final Intelligence Sections
        for section_key, content in final_sections.items():
            if content:
                # If it's a dict, we stringify it so it's searchable
                text_content = str(content) if not isinstance(content, str) else content
                
                texts.append(text_content)
                metadatas.append({
                    "person": persona_name,
                    "source": "intelligence_report",
                    "data_type": "final_summary",
                    "section": section_key,
                    "text": text_content
                })

        if texts:
            print(f"[RagService] Preparing to index {len(texts)} chunks for {persona_name} in namespace: '{namespace}'...")
            self.index_texts(texts, metadatas, namespace=namespace)

    def index_company_data(self, company_name: str, domain: str, mega_object: Dict[str, Any], final_sections: Dict[str, Any], namespace: str):
        """
        Indexes raw company data and final intelligence sections for a corporate report.
        """
        texts = []
        metadatas = []

        # 1. Company Identity & Meta
        company_meta = mega_object.get("company_data") or {}
        if company_meta:
            meta_text = f"Company: {company_name}\nDomain: {domain}\nDescription: {company_meta.get('description')}\nIndustry: {company_meta.get('industry')}"
            texts.append(meta_text)
            metadatas.append({
                "company": company_name,
                "domain": domain,
                "source": "company_profile",
                "data_type": "identity",
                "text": meta_text
            })

        # 2. Financials
        financials = mega_object.get("financials") or {}
        if financials:
            fin_text = f"Funding Stage: {financials.get('funding_stage')}\nTotal Raised: {financials.get('total_funding')}\nInvestors: {financials.get('investors')}"
            texts.append(fin_text)
            metadatas.append({
                "company": company_name,
                "domain": domain,
                "source": "financials",
                "data_type": "funding_data",
                "text": fin_text
            })

        # 3. Newsfeed
        news = mega_object.get("newsfeed") or []
        for item in news:
            if isinstance(item, dict) and item.get("title"):
                content = f"News Title: {item.get('title')}\nSnippet: {item.get('snippet')}\nDate: {item.get('date')}"
                texts.append(content)
                metadatas.append({
                    "company": company_name,
                    "domain": domain,
                    "source": "newsfeed",
                    "data_type": "news_article",
                    "title": item.get("title"),
                    "text": content
                })

        # 4. Competitors
        competitors = mega_object.get("competitors") or []
        for comp in competitors:
            if isinstance(comp, dict) and comp.get("name"):
                content = f"Competitor: {comp.get('name')}\nDomain: {comp.get('domain')}\nDescription: {comp.get('description')}"
                texts.append(content)
                metadatas.append({
                    "company": company_name,
                    "domain": domain,
                    "source": "competitors",
                    "data_type": "competitor_info",
                    "competitor_name": comp.get("name"),
                    "text": content
                })

        # 5. Techstack
        techstack = mega_object.get("techstack") or {}
        if techstack:
            tech_text = f"Techstack for {company_name}: {str(techstack)}"
            texts.append(tech_text)
            metadatas.append({
                "company": company_name,
                "domain": domain,
                "source": "technology",
                "data_type": "techstack",
                "text": tech_text
            })

        # 6. LinkedIn Posts (Company Activity)
        li_posts = mega_object.get("linkedin_posts") or []
        for p in li_posts:
            if isinstance(p, dict) and p.get("text"):
                texts.append(p["text"])
                metadatas.append({
                    "company": company_name,
                    "domain": domain,
                    "source": "linkedin",
                    "data_type": "raw_post",
                    "text": p["text"]
                })

        # 7. Final Intelligence Sections (Base Report)
        for section_key, content in final_sections.items():
            if content and section_key.startswith("section_"):
                # Map technical section IDs to readable names
                section_map = {
                    "section_01": "Executive Brief",
                    "section_02": "Market Position",
                    "section_03": "Product Intelligence",
                    "section_04": "Financial Profile",
                    "section_05": "Competitive Landscape",
                    "section_06": "Technology Fingerprint",
                    "section_07": "Talent & Org",
                    "section_08": "Leadership Personas",
                    "section_09": "Content & Messaging",
                    "section_10": "Strategic Signals",
                    "section_11": "SWOT Analysis",
                    "section_12": "Analyst Verdict"
                }
                
                header = section_map.get(section_key, section_key)
                text_content = str(content) if not isinstance(content, str) else content
                
                texts.append(text_content)
                metadatas.append({
                    "company": company_name,
                    "domain": domain,
                    "source": "base_report",
                    "data_type": "analyzed_summary",
                    "header": header,
                    "section": section_key,
                    "text": text_content
                })

        if texts:
            print(f"[RagService] Preparing to index {len(texts)} chunks for company {company_name} in namespace: '{namespace}'...")
            self.index_texts(texts, metadatas, namespace=namespace)

    def index_comparison_data(self, persona_a_name: str, persona_b_name: str, comparison_sections: Dict[str, Any], namespace: str):
        """
        Specialized indexing for comparative intelligence between two personas.
        Stored in a unique combined namespace.
        """
        print(f"[RagService] Indexing Comparison: {persona_a_name} vs {persona_b_name} in namespace: {namespace}")
        
        texts = []
        metadatas = []
        for section_key, section_data in comparison_sections.items():
            content = f"Comparison Section: {section_key}\n"
            content += f"Participants: {persona_a_name} and {persona_b_name}\n"
            content += f"Intelligence: {str(section_data)}"
            
            texts.append(content)
            metadatas.append({
                "source": "persona_comparison",
                "section": section_key,
                "persona_a": persona_a_name,
                "persona_b": persona_b_name,
                "type": "comparative_intelligence"
            })
            
        self.index_texts(texts, metadatas, namespace=namespace)

    def query(self, query_text: str, top_k: int = 5, filter: Optional[Dict[str, Any]] = None, namespace: str = "") -> List[Dict[str, Any]]:
        """
        Performs a semantic search for the given query text within a specific namespace.
        """
        # Embed the query
        query_embedding = self.embeddings.embed_query(query_text)

        # Search Pinecone
        results = self.vector_store.query(query_embedding, top_k=top_k, filter=filter, namespace=namespace)
        
        # Format results for easier consumption
        matches = []
        for match in results.get("matches", []):
            matches.append({
                "id": match.get("id"),
                "score": match.get("score"),
                "metadata": match.get("metadata"),
                "text": match.get("metadata", {}).get("text", "")
            })
        
        return matches

    async def query_batch(self, queries: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Executes multiple RAG queries in parallel using asyncio.to_thread.
        Each query dict can specify: query, top_k, filter, and namespace.
        """
        import asyncio
        
        async def _single_query(q_dict: Dict[str, Any]):
            return await asyncio.to_thread(
                self.query,
                query_text=q_dict.get("query"),
                top_k=q_dict.get("top_k", 5),
                filter=q_dict.get("filter"),
                namespace=q_dict.get("namespace", "")
            )
        
        tasks = [_single_query(q) for q in queries]
        results = await asyncio.gather(*tasks)
        
        # Flatten the results into a single list of chunks
        flattened = []
        for res_list in results:
            flattened.extend(res_list)
        return flattened

# ====================== Usage Example ======================

if __name__ == "__main__":
    rag = RagService()
    
    # Example indexing
    data = ["Sundar Pichai is the CEO of Google and Alphabet.", "Satya Nadella is the CEO of Microsoft."]
    meta = [{"person": "Sundar Pichai"}, {"person": "Satya Nadella"}]
    
    # rag.index_texts(data, meta)  # Uncomment to actually index
    
    # Example query
    # results = rag.query("Who leads Google?")
    # for res in results:
    #     print(f"Match: {res['metadata']} (Score: {res['score']})")