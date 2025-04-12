# /trialsage/controllers/protocol.py
# Protocol controller for TrialSage intelligence engine

import os
import json
import uuid
from typing import Dict, List, Optional, Any
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
import openai

# Check if OpenAI API key is available
if not os.environ.get("OPENAI_API_KEY"):
    raise Exception("OPENAI_API_KEY not found in environment variables")

# Setup OpenAI client
openai.api_key = os.environ.get("OPENAI_API_KEY")

# In-memory thread storage (would use database in production)
THREAD_STORAGE = {}

# Create API router
router = APIRouter(prefix="/api/intel", tags=["intelligence"])

# Model for protocol suggestions request
class ProtocolRequest(BaseModel):
    indication: str
    thread_id: Optional[str] = None
    include_quotes: bool = True
    verbose: bool = False
    additional_context: Optional[str] = None

# Model for continue request (SAP, IND 2.7, etc.)
class ContinueRequest(BaseModel):
    thread_id: str
    section: str  # "sap", "ind_2_7", etc.
    context: Optional[str] = None

# Model for evidence query
class EvidenceQuery(BaseModel):
    query: str
    indication: Optional[str] = None
    thread_id: Optional[str] = None

# Model for report export request
class ReportExportRequest(BaseModel):
    indication: str
    include_visuals: bool = True
    thread_id: Optional[str] = None

# Create or retrieve thread
def get_or_create_thread(thread_id: Optional[str] = None) -> str:
    """Create a new thread or retrieve an existing one"""
    if thread_id and thread_id in THREAD_STORAGE:
        return thread_id
    
    new_thread_id = str(uuid.uuid4())
    THREAD_STORAGE[new_thread_id] = {
        "messages": [],
        "context": {}
    }
    return new_thread_id

# Add message to thread
def add_message_to_thread(thread_id: str, role: str, content: str) -> None:
    """Add a message to the thread storage"""
    if thread_id not in THREAD_STORAGE:
        raise ValueError(f"Thread {thread_id} not found")
    
    THREAD_STORAGE[thread_id]["messages"].append({
        "role": role,
        "content": content
    })

# Get thread messages
def get_thread_messages(thread_id: str) -> List[Dict[str, str]]:
    """Get all messages from a thread"""
    if thread_id not in THREAD_STORAGE:
        raise ValueError(f"Thread {thread_id} not found")
    
    return THREAD_STORAGE[thread_id]["messages"]

# Generate protocol recommendations
@router.post("/protocol-suggestions")
async def get_protocol_suggestions(request: ProtocolRequest) -> Dict[str, Any]:
    """
    Generate protocol recommendations based on the provided indication
    
    Parameters:
    - indication: The medical condition/indication for the study
    - thread_id: Optional thread ID for conversation continuity
    - include_quotes: Include supporting quotes from CSRs
    - verbose: Include additional details in response
    
    Returns:
    - Dictionary with protocol recommendations and supporting evidence
    """
    try:
        # Get or create thread
        thread_id = get_or_create_thread(request.thread_id)
        
        # Generate prompt for AI
        prompt = f"""You are the TrialSage Clinical Study Intelligence Engine, an expert in protocol design.
        
Generate an evidence-based clinical trial protocol recommendation for: {request.indication}
        
Your response should include:
1. A detailed protocol recommendation
2. IND Module 2.5 (Clinical Overview) content
3. Risk analysis summary
4. Supporting citations from CSRs

{request.additional_context or ''}"""
        
        # Add user message to thread
        add_message_to_thread(thread_id, "user", prompt)
        
        # Get conversation history
        messages = get_thread_messages(thread_id)
        
        # Call OpenAI API
        response = openai.ChatCompletion.create(
            model="gpt-4-turbo",  # Use the best available model
            messages=[{"role": m["role"], "content": m["content"]} for m in messages],
            max_tokens=2000,
            temperature=0.3,
        )
        
        # Extract AI response
        ai_response = response.choices[0].message.content
        
        # Add AI response to thread
        add_message_to_thread(thread_id, "assistant", ai_response)
        
        # Extract structured content from response
        # In a production system, this would be more sophisticated parsing
        sections = ai_response.split("\n\n")
        
        recommendation = ""
        ind_module_2_5 = {"title": "Clinical Overview", "content": ""}
        risk_summary = ""
        citations = []
        evidence = []
        
        for section in sections:
            if "protocol recommendation" in section.lower():
                recommendation = section
            elif "ind module 2.5" in section.lower() or "clinical overview" in section.lower():
                ind_module_2_5["content"] = section
            elif "risk" in section.lower() and "summary" in section.lower():
                risk_summary = section
            elif "citation" in section.lower() or "reference" in section.lower():
                citations = [cit.strip() for cit in section.split("\n") if cit.strip()]
            elif "evidence" in section.lower() or "supporting data" in section.lower():
                evidence = [ev.strip() for ev in section.split("\n") if ev.strip()]
        
        result = {
            "success": True,
            "thread_id": thread_id,
            "recommendation": recommendation,
            "ind_module_2_5": ind_module_2_5,
            "risk_summary": risk_summary,
            "response": ai_response,
        }
        
        if request.include_quotes:
            result["citations"] = citations
            result["evidence"] = evidence
            
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating protocol suggestions: {str(e)}")

# Continue thread with specified section
@router.post("/continue-workflow")
async def continue_workflow(request: ContinueRequest) -> Dict[str, Any]:
    """
    Continue a conversation thread to generate additional protocol sections
    
    Parameters:
    - thread_id: The conversation thread ID
    - section: The section to generate (e.g., "sap", "ind_2_7")
    - context: Optional additional context
    
    Returns:
    - Dictionary with the generated content
    """
    try:
        if request.thread_id not in THREAD_STORAGE:
            raise HTTPException(status_code=404, detail="Thread not found")
        
        # Generate prompt based on requested section
        if request.section.lower() == "sap":
            prompt = """Based on the protocol we've discussed, generate a Statistical Analysis Plan (SAP) that includes:
            
1. Primary analysis methods
2. Statistical assumptions
3. Sample size calculations
4. Interim analysis plans
5. Handling of missing data
            """
        elif request.section.lower() == "ind_2_7":
            prompt = """Based on the protocol we've discussed, generate Module 2.7 (Clinical Summary) content that includes:
            
1. Summary of clinical pharmacology studies
2. Summary of clinical efficacy
3. Summary of clinical safety
4. Benefit-risk conclusions
            """
        else:
            prompt = f"Generate additional information for the {request.section} section of our protocol."
        
        if request.context:
            prompt += f"\n\nAdditional context: {request.context}"
        
        # Add user message to thread
        add_message_to_thread(request.thread_id, "user", prompt)
        
        # Get conversation history
        messages = get_thread_messages(request.thread_id)
        
        # Call OpenAI API
        response = openai.ChatCompletion.create(
            model="gpt-4-turbo",  # Use the best available model
            messages=[{"role": m["role"], "content": m["content"]} for m in messages],
            max_tokens=2000,
            temperature=0.3,
        )
        
        # Extract AI response
        ai_response = response.choices[0].message.content
        
        # Add AI response to thread
        add_message_to_thread(request.thread_id, "assistant", ai_response)
        
        # Return the response
        return {
            "success": True,
            "thread_id": request.thread_id,
            "section": request.section,
            "content": ai_response,
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error continuing workflow: {str(e)}")

# Query for CSR evidence
@router.post("/csr-evidence")
async def get_csr_evidence(request: EvidenceQuery) -> Dict[str, Any]:
    """
    Find evidence in CSR corpus for a specific query
    
    Parameters:
    - query: The natural language query to search for
    - indication: Optional indication to filter by
    - thread_id: Optional thread ID for conversation continuity
    
    Returns:
    - Dictionary with matching evidence
    """
    try:
        # Get or create thread
        thread_id = get_or_create_thread(request.thread_id)
        
        # Generate mock evidence (in production, this would search a vector database)
        evidence = [
            f"Evidence for '{request.query}' found in CSR-123: Endpoint success rate of 68% vs 42% for placebo",
            f"Evidence for '{request.query}' found in CSR-456: Mean change from baseline was statistically significant (p<0.001)",
            f"Evidence for '{request.query}' found in CSR-789: Safety profile showed acceptable tolerability with common AEs of headache (12%) and nausea (8%)"
        ]
        
        # Add query and response to thread for context continuity
        add_message_to_thread(thread_id, "user", f"Find evidence for: {request.query}")
        add_message_to_thread(thread_id, "assistant", "\n".join(evidence))
        
        return {
            "success": True,
            "thread_id": thread_id,
            "query": request.query,
            "evidence": evidence,
            "count": len(evidence)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving CSR evidence: {str(e)}")

# Generate and export report
@router.post("/generate-report")
async def generate_report(request: ReportExportRequest) -> Dict[str, Any]:
    """
    Generate a comprehensive report for the given indication
    
    Parameters:
    - indication: The medical condition/indication for the report
    - include_visuals: Include visualizations in the report
    - thread_id: Optional thread ID for conversation continuity
    
    Returns:
    - Dictionary with report details and download link
    """
    try:
        # Get or create thread
        thread_id = get_or_create_thread(request.thread_id)
        
        # In a production system, this would call a report generation service
        # For now, we'll simulate the report generation with a delay
        
        # Generate report filename
        timestamp = uuid.uuid4().hex[:8]
        filename = f"trialsage_report_{timestamp}.pdf"
        
        # Update static/latest_report.pdf symlink 
        # This would be done by the actual report generator in production
        
        return {
            "success": True,
            "thread_id": thread_id,
            "indication": request.indication,
            "report_url": f"/static/{filename}",
            "latest_report_url": "/static/latest_report.pdf",
            "timestamp": timestamp
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating report: {str(e)}")

# Health check endpoint
@router.get("/health")
async def health_check() -> Dict[str, Any]:
    """Check the health of the intelligence engine"""
    return {
        "status": "healthy",
        "model": "gpt-4-turbo",
        "threads_active": len(THREAD_STORAGE)
    }