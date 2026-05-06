from fastapi import FastAPI, HTTPException, Security, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from src.graph import agent_graph
from src.services.backend_client import BackendClient
from persona.services.rag_service import RagService
from src.services.company_analysis_service import CompanyAnalysisService
from typing import Dict, Any, Optional, List


from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Leo AI Agents API — Corporate Intelligence Suite")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

backend_client = BackendClient()

# ─── Request/Response Models ────────────────────────────────────────

class ReportByDomainRequest(BaseModel):
    domain: str  # e.g. "lio.ai"

class ReportByDataRequest(BaseModel):
    raw_data: Dict[str, Any]  # Full Mega-Object directly (for testing)

class SectionOutput(BaseModel):
    executive_brief: Optional[Any] = None
    market_position: Optional[Any] = None
    product_intelligence: Optional[Any] = None
    financial_profile: Optional[Any] = None
    competitive_landscape: Optional[Any] = None
    technology_fingerprint: Optional[Any] = None
    talent_org_intelligence: Optional[Any] = None
    leadership_personas: Optional[Any] = None
    content_messaging: Optional[Any] = None
    strategic_signals: Optional[Any] = None
    swot: Optional[Any] = None
    analyst_verdict: Optional[Any] = None
    leaders_data: Optional[Any] = None
    ai_highlights: Optional[Dict[str, Any]] = None


class ReportResponse(BaseModel):
    success: bool
    domain: Optional[str] = None
    full_report: Optional[SectionOutput] = None
    errors: Optional[List[str]] = None


# ─── Helper: Run graph ───────────────────────────────────────────────

def build_initial_state(raw_data: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "raw_data": raw_data,
        "section_01": "",
        "section_02": "",
        "section_03": "",
        "section_04": "",
        "section_05": "",
        "section_06": "",
        "section_07": "",
        "section_08": "",
        "section_09": "",
        "section_10": "",
        "section_11": "",
        "section_12": "",
        "errors": []
    }

def extract_report(result: Dict[str, Any]) -> SectionOutput:
    # Extract leaders directly from raw_data for the UI
    raw_data = result.get("raw_data", {})
    employees = raw_data.get("employees", [])
    leaders = []
    if employees:
        leader_keywords = ["ceo", "cto", "co-founder", "president", "vp", "chief", "founder", "director"]
        for emp in employees:
            if any(kw in emp.get("title", "").lower() for kw in leader_keywords):
                leaders.append(emp)
    if not leaders and employees:
        leaders = employees[:10]
        
    return SectionOutput(
        executive_brief=result.get("section_01", ""),
        market_position=result.get("section_02", ""),
        product_intelligence=result.get("section_03", ""),
        financial_profile=result.get("section_04", ""),
        competitive_landscape=result.get("section_05", ""),
        technology_fingerprint=result.get("section_06", ""),
        talent_org_intelligence=result.get("section_07", ""),
        leadership_personas=result.get("section_08", ""),
        content_messaging=result.get("section_09", ""),
        strategic_signals=result.get("section_10", ""),
        swot=result.get("section_11", ""),
        analyst_verdict=result.get("section_12", ""),
        leaders_data=leaders,
        ai_highlights=result.get("ai_highlights", None)
    )



# ─── Endpoint 1: Report from Domain (production flow) ───────────────

from fastapi import Request

@app.post("/api/agents/full-report", response_model=ReportResponse)
async def generate_report_by_domain(req: Request, payload: ReportByDomainRequest):
    """
    Production endpoint. Accepts a company domain.
    Internally fetches the Mega-Object from the Backend DB, runs the 12-section agent,
    and then saves the generated report back to the Backend.
    """
    domain = payload.domain

    auth_header = req.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header. A valid JWT is required.")
    
    token = auth_header.split(" ")[1]

    # 1. Fetch Mega-Object from Backend
    mega_object = backend_client.get_mega_object(domain)

    if not mega_object:
        raise HTTPException(
            status_code=404,
            detail=f"No data found for domain '{domain}'. Make sure to call /api/gather/company first."
        )

    # 2. Run the agent graph
    try:
        initial_state = build_initial_state(mega_object)
        result = await agent_graph.ainvoke(initial_state)

        if result.get("errors"):
            return ReportResponse(success=False, domain=domain, errors=result["errors"])

        report = extract_report(result)

        # 3. Save the base report to the User's account via the TS Backend
        company_name = mega_object.get("company_data", {}).get("name", domain)
        saved_response = backend_client.save_company_report(domain, company_name, report.model_dump(), token)

        if not saved_response:
            print(f"[Warning] Base report generated but failed to save for domain: {domain}")
            # Use a fallback ID if save failed
            report_id = f"fallback_{domain}"
        else:
            report_id = saved_response.get("saved_company_id", saved_response.get("report", {}).get("id", f"fallback_{domain}"))

        # 4. Sequential RAG Indexing
        # We perform this AFTER the base report is saved to ensure we have a unique report_id for isolation.
        try:
            rag_service = RagService()
            
            # Step A: Index raw data + base report into RAG
            print(f"[Main] Indexing company data for report_id: {report_id}")
            rag_service.index_company_data(
                company_name=company_name,
                domain=domain,
                mega_object=mega_object,
                final_sections=result,
                namespace=report_id
            )
            
            # Note: We skip the automatic generation of AI Insights here.
            # They will be generated on-demand when the user clicks the cards in the dashboard.
            
        except Exception as rag_err:
            print(f"[Warning] RAG Indexing failed for {domain}: {str(rag_err)}")
            # We still return the base report even if RAG failed


        return ReportResponse(
            success=True,
            domain=domain,
            full_report=report
        )


    except Exception as e:
        print(f"[FastAPI Error]: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ─── Endpoint 2: Report from Raw Data (for testing) ─────────────────

@app.post("/api/agents/full-report/raw", response_model=ReportResponse)
async def generate_report_from_raw(request: ReportByDataRequest):
    """
    Test/debug endpoint. Accepts a raw Mega-Object directly, skips the Backend DB lookup.
    """
    try:
        initial_state = build_initial_state(request.raw_data)
        result = await agent_graph.ainvoke(initial_state)

        if result.get("errors"):
            return ReportResponse(success=False, errors=result["errors"])

        return ReportResponse(
            success=True,
            full_report=extract_report(result)
        )

    except Exception as e:
        print(f"[FastAPI Error]: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ─── Health Check ────────────────────────────────────────────────────

@app.get("/")
async def root():
    return {"message": "Leo AI Agents API — Corporate Intelligence Suite is active"}


# ─── Persona Deep Dive Endpoint ───────────────────────────────────────

from persona.runner import run_persona_pipeline
from persona.services.rag_service import RagService
from persona.services.chat_service import PersonaChatService
from persona.common.report import save_persona_report
from persona.common.auth import verify_token, get_current_user_id, security

class PersonaRequest(BaseModel):
    name: str
    designation: str
    company: str
    linkedin_url: Optional[str] = None
    twitter_handle: Optional[str] = None

class PersonaChatRequest(BaseModel):
    report_id: str
    query: str

class PersonaCompareRequest(BaseModel):
    report1_id: str
    report2_id: str

class PersonaCompareInsightRequest(BaseModel):
    comparison_id: str
    report1_id: str
    report2_id: str
    user_question: Optional[str] = "How should I approach these two executives?"

@app.post("/api/persona/compare")
@app.post("/api/persona/compare/")
async def compare_personas(request: Request):
    """
    DEBUG VERSION: To find why it's crashing.
    """
    print("\n[DEBUG] [RAW_REQUEST] Incoming request to /api/persona/compare")
    print(f"[DEBUG] [RAW_REQUEST] Headers: {dict(request.headers)}")
    
    try:
        body = await request.json()
        print(f"[DEBUG] [RAW_REQUEST] Body: {body}")
        
        # Manually try to get token and verify
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            print("[DEBUG] [RAW_REQUEST] ERROR: Missing or malformed Bearer token")
            return {"success": False, "error": "Missing or malformed Bearer token"}
            
        token = auth_header.split(" ")[1]
        print(f"[DEBUG] [RAW_REQUEST] Manual Token Extraction: {token[:10]}...")
        
        # Manually extract user_id from JWT payload
        import jwt
        try:
            payload = jwt.decode(token, options={"verify_signature": False})
            user_id = payload.get("sub") or payload.get("id")
            print(f"[DEBUG] [RAW_REQUEST] Real User ID extracted: {user_id}")
        except:
            user_id = "unknown_user"
            print("[DEBUG] [RAW_REQUEST] WARNING: Could not extract user_id, using 'unknown_user'")
        
        from persona.compare.graph import persona_compare_graph
        print("[DEBUG] [RAW_REQUEST] Calling graph...")
        result = await persona_compare_graph.run(
            report1_id=body.get("report1_id"),
            report2_id=body.get("report2_id"),
            token=token,
            user_id=user_id
        )
        print("[DEBUG] [RAW_REQUEST] Graph finished.")
        return {"success": True, "data": result}
        
    except Exception as e:
        import traceback
        print(f"[DEBUG] [RAW_REQUEST] CRASH: {str(e)}")
        print(traceback.format_exc())
        return {"success": False, "error": str(e)}

# ─── Comparison Insights Endpoints ────────────────────────────────────

from persona.common.insights import (
    network_collision,
    executive_dominance,
    behavioral_tension,
    adversarial_modeling,
    strategic_verdict
)

async def _handle_compare_insight_request(request: Request, insight_func):
    """Helper to handle persona comparison insight requests with token validation."""
    try:
        body = await request.json()
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return {"success": False, "error": "Missing or malformed token"}
        token = auth_header.split(" ")[1]

        result = await insight_func(
            comparison_id=body.get("comparison_id"),
            report1_id=body.get("report1_id"),
            report2_id=body.get("report2_id"),
            user_question=body.get("user_question", "Analyze these personas"),
            token=token
        )
        return {"success": True, "data": result}
    except Exception as e:
        print(f"[API Error] Insight failed: {e}")
        return {"success": False, "error": str(e)}

@app.post("/api/persona/compare/network")
async def get_network_insight(request: Request):
    return await _handle_compare_insight_request(request, network_collision)

@app.post("/api/persona/compare/dominance")
async def get_dominance_insight(request: Request):
    return await _handle_compare_insight_request(request, executive_dominance)

@app.post("/api/persona/compare/behavior")
async def get_behavior_insight(request: Request):
    return await _handle_compare_insight_request(request, behavioral_tension)

@app.post("/api/persona/compare/skills")
async def get_skills_insight(request: Request):
    return await _handle_compare_insight_request(request, skills_power_gap)

@app.post("/api/persona/compare/influence")
async def get_influence_insight(request: Request):
    return await _handle_compare_insight_request(request, influence_credibility)

@app.post("/api/persona/compare/adversarial")
async def get_adversarial_insight(request: Request):
    return await _handle_compare_insight_request(request, adversarial_modeling)

@app.post("/api/persona/compare/verdict")
async def get_verdict_insight(request: Request):
    return await _handle_compare_insight_request(request, strategic_verdict)

class PersonaChatResponse(BaseModel):
    success: bool
    answer: str
    sources: Optional[List[Dict[str, Any]]] = None
    error: Optional[str] = None

class ForensicInsightRequest(BaseModel):
    report_id: str
    theme_id: str
    target_name: str
    company_name: str
    comparison_id: Optional[str] = None
    compare_report_id: Optional[str] = None

class ForensicInsightResponse(BaseModel):
    success: bool
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

class PersonaResponse(BaseModel):
    success: bool
    subject: Optional[Dict[str, str]] = None
    sections: Optional[Dict[str, Any]] = None
    report_id: Optional[str] = None
    user_id: Optional[str] = None
    created_at: Optional[str] = None
    errors: Optional[List[str]] = None

@app.post("/api/persona/deep-dive", response_model=PersonaResponse)
async def generate_persona_deep_dive(
    payload: PersonaRequest,
    token_payload: dict = Depends(verify_token),
    req: Request = None
):
    """
    Runs the 11-nodes persona deep dive pipeline.
    """
    try:
        # Extract token string from header for saving later
        auth_header = req.headers.get("Authorization")
        token = auth_header.split(" ")[1] if auth_header else ""

        # 1. Run the core pipeline
        result = run_persona_pipeline(
            name=payload.name,
            designation=payload.designation,
            company=payload.company,
            linkedin_url=payload.linkedin_url,
            twitter_handle=payload.twitter_handle,
        )
        
        subject = result.get("subject")
        sections = result.get("sections")
        full_state = result.get("full_state")

        # 2. Save to Database first to get a unique Report ID for namespacing
        report_id = "default"
        user_id = None
        created_at = None
        try:
            report_obj = await save_persona_report(
                subject=subject,
                sections=sections,
                token=token
            )
            if report_obj:
                report_id = report_obj.get("id", "default")
                user_id = report_obj.get("user_id")
                created_at = report_obj.get("created_at")
        except Exception as e:
            print(f"[Warning] Persistence failed: {str(e)}")

        # 3. Multi-layer RAG Indexing using the Report ID as a Namespace
        try:
            rag_service = RagService()
            rag_service.index_persona_data(
                persona_name=payload.name,
                state_dict=full_state,
                final_sections=sections,
                namespace=report_id
            )
        except Exception as e:
            print(f"[Warning] RAG indexing failed: {str(e)}")

        return PersonaResponse(
            success=True,
            subject=subject,
            sections=sections,
            report_id=report_id if report_id != "default" else None,
            user_id=user_id,
            created_at=created_at,
            errors=result.get("errors")
        )
    except Exception as e:
        import traceback
        err_msg = traceback.format_exc()
        print(f"[Persona Endpoint Error]:\n{err_msg}")
        raise HTTPException(status_code=500, detail=str(e))

# ======================
# CHAT ENDPOINT
# ======================

@app.post("/api/persona/chat", response_model=PersonaChatResponse)
async def persona_chat(
    payload: PersonaChatRequest,
    auth_payload: dict = Security(verify_token)
):
    """
    RAG-powered chat for a specific persona report.
    """
    try:
        chat_service = PersonaChatService()
        result = await chat_service.answer_question(
            report_id=payload.report_id,
            question=payload.query
        )
        
        if "error" in result:
            return PersonaChatResponse(
                success=False,
                answer=result.get("answer", "Error"),
                error=result.get("error")
            )
            
        return PersonaChatResponse(
            success=True,
            answer=result.get("answer"),
            sources=result.get("sources")
        )
    except Exception as e:
        return PersonaChatResponse(
            success=False,
            answer="Internal server error",
            error=str(e)
        )

@app.post("/api/persona/forensic-insight", response_model=ForensicInsightResponse)
async def get_forensic_insight(
    payload: ForensicInsightRequest,
    req: Request,
    auth_payload: dict = Security(verify_token)
):
    """
    On-demand forensic analysis for a specific theme.
    """
    try:
        from persona.services.forensic_service import ForensicService
        forensic_service = ForensicService()
        
        auth_header = auth_payload  # Depending on how verify_token returns, might need req.headers
        token = req.headers.get("Authorization", "").split(" ")[1] if req.headers.get("Authorization") else ""

        result = await forensic_service.generate_theme(
            theme_id=payload.theme_id,
            target_name=payload.target_name,
            company_name=payload.company_name,
            report_id=payload.report_id,
            comparison_id=payload.comparison_id,
            compare_report_id=payload.compare_report_id,
            token=token
        )
        
        if "error" in result:
            return ForensicInsightResponse(
                success=False,
                error=result["error"]
            )
            
        return ForensicInsightResponse(
            success=True,
            data=result
        )
    except Exception as e:
        return ForensicInsightResponse(
            success=False,
            error=str(e)
        )

@app.post("/api/agents/company-forensic", response_model=ForensicInsightResponse)
async def get_company_forensic_insight(
    payload: ForensicInsightRequest,
    req: Request,
    auth_payload: dict = Security(verify_token)
):
    """
    On-demand forensic analysis for a specific company theme.
    """
    return await get_forensic_insight(payload, req, auth_payload)

if __name__ == "__main__":

    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
