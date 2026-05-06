import os
from parallel import Parallel
from parallel.types import TaskSpecParam

class PersonaService:
    def __init__(self, name: str, designation: str, company: str, linkedin_url: str = None, twitter_handle: str = None):
        self.name = name
        self.designation = designation
        self.company = company
        self.linkedin_url = linkedin_url
        self.twitter_handle = twitter_handle
        self.client = Parallel(api_key=os.environ["PARALLEL_API_KEY"])

    def retrieve_data(self) -> dict:
        identifiers = f"Name: {self.name}\nDesignation: {self.designation}\nCompany: {self.company}"
        if self.linkedin_url:
            identifiers += f"\nLinkedIn: {self.linkedin_url}"
        if self.twitter_handle:
            identifiers += f"\nTwitter/X: {self.twitter_handle}"

        task_run = self.client.task_run.create(
            input=f"""
Extract comprehensive persona intelligence for this professional.
{identifiers}

Research across LinkedIn, Twitter/X, GitHub, news articles, interviews, 
publications, and any public web presence. 
Go as deep as possible — career history, personality signals, 
communication style, online activity, achievements, and personal interests.
""",
            task_spec=TaskSpecParam(
                output_schema={
                    "type": "json",
                    "json_schema": {
                        "type": "object",
                        "properties": {
                            "full_name": {
                                "type": "string",
                                "description": "Full name of the person"
                            },
                            "current_role": {
                                "type": "string",
                                "description": "Current job title and company"
                            },
                            "professional_summary": {
                                "type": "string",
                                "description": "2-3 sentence professional overview"
                            },
                            "career_history": {
                                "type": "array",
                                "description": "List of previous roles with company, title, duration",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "company": {"type": "string"},
                                        "title": {"type": "string"},
                                        "duration": {"type": "string"}
                                    }
                                }
                            },
                            "education": {
                                "type": "array",
                                "description": "Educational background",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "institution": {"type": "string"},
                                        "degree": {"type": "string"},
                                        "year": {"type": "string"}
                                    }
                                }
                            },
                            "skills": {
                                "type": "array",
                                "description": "Top technical and soft skills",
                                "items": {"type": "string"}
                            },
                            "personality_signals": {
                                "type": "object",
                                "description": "Personality and communication insights",
                                "properties": {
                                    "communication_style": {"type": "string"},
                                    "leadership_style": {"type": "string"},
                                    "key_interests": {
                                        "type": "array",
                                        "items": {"type": "string"}
                                    },
                                    "values": {
                                        "type": "array",
                                        "items": {"type": "string"}
                                    }
                                }
                            },
                            "online_presence": {
                                "type": "object",
                                "description": "Social and online activity",
                                "properties": {
                                    "linkedin_url": {"type": "string"},
                                    "twitter_handle": {"type": "string"},
                                    "github_handle": {"type": "string"},
                                    "personal_website": {"type": "string"},
                                    "recent_posts_summary": {"type": "string"}
                                }
                            },
                            "publications_and_talks": {
                                "type": "array",
                                "description": "Articles, talks, podcasts, or publications",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "title": {"type": "string"},
                                        "type": {"type": "string"},
                                        "date": {"type": "string"},
                                        "url": {"type": "string"}
                                    }
                                }
                            },
                            "achievements": {
                                "type": "array",
                                "description": "Notable achievements and recognition",
                                "items": {"type": "string"}
                            },
                            "how_to_approach": {
                                "type": "string",
                                "description": "How to best communicate and engage with this person based on their style"
                            },
                            "red_flags": {
                                "type": "array",
                                "description": "Any concerning signals or risks",
                                "items": {"type": "string"}
                            },
                            "influence_score": {
                                "type": "number",
                                "description": "Influence score 0-100 based on online presence and impact"
                            },
                            "data_confidence": {
                                "type": "string",
                                "description": "high/medium/low based on how much public data was found"
                            }
                        },
                        "required": [
                            "full_name",
                            "current_role", 
                            "professional_summary",
                            "career_history",
                            "skills",
                            "personality_signals",
                            "online_presence",
                            "achievements",
                            "how_to_approach",
                            "influence_score",
                            "data_confidence"
                        ],
                        "additionalProperties": False
                    }
                }
            ),
            processor="base"
        )

        print(f"[PersonaService] Task created. Run ID: {task_run.run_id}")
        
        run_result = self.client.task_run.result(
            task_run.run_id, 
            api_timeout=3600
        )
        
        output = run_result.output
        if hasattr(output, "model_dump"):
            return output.model_dump()
        if hasattr(output, "dict"):
            return output.dict()
        return output