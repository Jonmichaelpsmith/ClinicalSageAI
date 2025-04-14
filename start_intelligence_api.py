#!/usr/bin/env python3
"""
Combined Intelligence API Service for LumenTrialGuide

This script combines all Python-based intelligence services into a single FastAPI application,
including:
- CSR data extraction and search
- Assistant context generation
- Protocol alignment scores and recommendations
- Intelligence indicators for sessions
- IND document generation with CSR context
"""

import os
import sys
import json
import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse

# Load environment variables
load_dotenv()

# Configure base paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SESSIONS_DIR = os.path.join(BASE_DIR, "lumen_reports_backend", "sessions")

# Create FastAPI app
app = FastAPI(
    title="LumenTrialGuide Intelligence API",
    description="Combined API for clinical trial intelligence services",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import all intelligence modules
try:
    # Import CSR context generation API
    from csr_api import router as csr_router
    app.include_router(csr_router, prefix="", tags=["CSR Search"])
    print("CSR API router successfully loaded")
except ImportError as e:
    print(f"Failed to import csr_api: {e}")

# Define intelligence indicators endpoint
@app.get("/api/session/intelligence-indicators/{session_id}")
async def get_intelligence_indicators(session_id: str):
    """
    Return available intelligence artifacts for a planning session.
    
    Args:
        session_id: Unique identifier for the planning session
        
    Returns:
        JSON with boolean status for each intelligence artifact
    """
    session_dir = os.path.join(SESSIONS_DIR, session_id)
    
    if not os.path.exists(session_dir):
        os.makedirs(session_dir, exist_ok=True)
        return {
            "ind_summary": False,
            "summary_packet": False,
            "alignment_score": False,
            "suggestions": False,
            "sap_summary": False,
            "strategy_slide": False,
            "risk_model": False,
            "success_model": False,
            "wisdom_trace": False
        }
    
    # Check existence of each artifact file
    indicators = {
        "ind_summary": os.path.exists(os.path.join(session_dir, "ind_module_with_context.docx")),
        "summary_packet": os.path.exists(os.path.join(session_dir, "summary_packet.pdf")),
        "alignment_score": os.path.exists(os.path.join(session_dir, "alignment_score_report.json")),
        "suggestions": os.path.exists(os.path.join(session_dir, "suggested_corrections.json")),
        "sap_summary": os.path.exists(os.path.join(session_dir, "sap_summary_branded.docx")),
        "strategy_slide": os.path.exists(os.path.join(session_dir, "trial_strategy_deck.pptx")),
        "risk_model": os.path.exists(os.path.join(session_dir, "dropout_forecast.json")),
        "success_model": os.path.exists(os.path.join(session_dir, "success_prediction.json")),
        "wisdom_trace": os.path.exists(os.path.join(session_dir, "wisdom_trace.json"))
    }
    
    return indicators

# Define IND context generation endpoint
@app.post("/api/planner/generate-ind")
async def generate_ind_summary(request_data: dict = Body(...)):
    """
    Generate an IND summary with CSR context
    
    Args:
        request_data: JSON payload with protocol text and CSR context
        
    Returns:
        JSON with generated IND summary
    """
    protocol = request_data.get("protocol", "")
    session_id = request_data.get("sessionId", "adhoc")
    csr_context = request_data.get("csrContext", None)
    
    if not protocol:
        raise HTTPException(status_code=400, detail="Protocol text is required")
    
    # This is a placeholder. In the full implementation, 
    # the actual CSR context processing logic would happen here,
    # typically calling out to NLP services and knowledge bases
    
    # Generate a basic IND summary template
    ind_summary = f"""# INVESTIGATIONAL NEW DRUG (IND) MODULE 2.5
## CLINICAL OVERVIEW

### Introduction
This section provides a comprehensive clinical overview for the proposed study based on the provided protocol.

### Study Rationale
The study is designed to investigate {csr_context.get('indication', 'the indication')} in Phase {csr_context.get('phase', 'X')}.

### Efficacy Overview
The proposed protocol establishes suitable endpoints to measure efficacy in alignment with regulatory expectations.

### Safety Overview
The protocol includes appropriate safety monitoring measures.

### Benefit-Risk Assessment
Based on available data, the benefit-risk profile is favorable for proceeding with the proposed study.
"""
    
    # Save to session directory
    if session_id and session_id != "adhoc":
        session_dir = os.path.join(SESSIONS_DIR, session_id)
        os.makedirs(session_dir, exist_ok=True)
        
        # Save the IND summary with context
        with open(os.path.join(session_dir, "ind_module_with_context.docx"), "w") as f:
            f.write(ind_summary)
    
    return {
        "success": True,
        "content": ind_summary
    }

# Define planning initialization endpoint
@app.post("/api/planning/init")
async def initialize_planning_session(request_data: dict = Body(...)):
    """
    Initialize a planning session with CSR context
    
    Args:
        request_data: JSON payload with session details and CSR ID
        
    Returns:
        JSON with session initialization status
    """
    session_id = request_data.get("sessionId", "")
    csr_id = request_data.get("csrId", "")
    
    if not session_id:
        raise HTTPException(status_code=400, detail="Session ID is required")
    
    # Create session directory
    session_dir = os.path.join(SESSIONS_DIR, session_id)
    os.makedirs(session_dir, exist_ok=True)
    
    # Store session initialization data
    with open(os.path.join(session_dir, "session_metadata.json"), "w") as f:
        json.dump({
            "session_id": session_id,
            "csr_id": csr_id,
            "initialized_at": str(None)  # Would use datetime in real implementation
        }, f)
    
    return {
        "success": True,
        "message": f"Planning session {session_id} initialized successfully"
    }

# Define IND DOCX export endpoint
@app.post("/api/export/ind-docx-with-context")
async def export_ind_docx(request_data: dict = Body(...)):
    """
    Export IND summary as a DOCX file with CSR context
    
    Args:
        request_data: JSON payload with session ID
        
    Returns:
        DOCX file as a download
    """
    session_id = request_data.get("sessionId", "")
    
    if not session_id:
        raise HTTPException(status_code=400, detail="Session ID is required")
    
    # Check if file exists
    ind_docx_path = os.path.join(SESSIONS_DIR, session_id, "ind_module_with_context.docx")
    
    if not os.path.exists(ind_docx_path):
        # In real implementation, this would generate the file dynamically
        # For this placeholder, we'll return an error
        raise HTTPException(status_code=404, detail="IND DOCX file not found")
    
    return FileResponse(
        ind_docx_path,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        filename="ind_module_with_context.docx"
    )

# Root endpoint
@app.get("/")
async def root():
    return {
        "service": "LumenTrialGuide Intelligence API",
        "status": "active",
        "endpoints": {
            "csr_context": "/api/context/assistant-csr/{csr_id}",
            "intelligence_indicators": "/api/session/intelligence-indicators/{session_id}",
            "generate_ind": "/api/planner/generate-ind",
            "planning_init": "/api/planning/init",
            "export_ind_docx": "/api/export/ind-docx-with-context"
        }
    }

if __name__ == "__main__":
    # Create sessions directory if it doesn't exist
    os.makedirs(SESSIONS_DIR, exist_ok=True)
    
    # Start the server - use a different port than the main app (8000 instead of 5000)
    port = int(os.environ.get("PYTHON_API_PORT", 8000))
    host = os.environ.get("PYTHON_API_HOST", "0.0.0.0")
    
    uvicorn.run(app, host=host, port=port)