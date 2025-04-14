#!/usr/bin/env python3
import os
import json
from fastapi import FastAPI, APIRouter
from fastapi.responses import JSONResponse
from typing import Dict, List, Optional, Any

# Create a router for the intelligence indicators endpoints
router = APIRouter()

@router.get("/api/session/intelligence-indicators/{session_id}")
def intelligence_indicators(session_id: str):
    # The base directory for session archives
    archive_dir = os.path.join(os.getcwd(), "lumen_reports_backend/sessions", session_id)
    
    # Ensure the directory exists
    if not os.path.exists(archive_dir):
        return JSONResponse(
            status_code=404,
            content={"error": f"Session directory not found: {session_id}"}
        )

    # Helper function to check if a file exists
    def exists(file: str) -> bool:
        return os.path.exists(os.path.join(archive_dir, file))

    # Return the status of all intelligence artifacts
    return JSONResponse(content={
        "ind_summary": exists("ind_module_with_context.docx"),
        "summary_packet": exists("summary_packet.pdf"),
        "alignment_score": exists("alignment_score_report.json"),
        "suggestions": exists("suggested_corrections.json"),
        "sap_summary": exists("sap_summary_branded.docx"),
        "strategy_slide": exists("trial_strategy_deck.pptx"),
        "risk_model": exists("dropout_forecast.json"),
        "success_model": exists("success_prediction.json"),
        "wisdom_trace": exists("wisdom_trace.json")
    })

# Function to include this router in the main FastAPI app
def register_intelligence_routes(app: FastAPI):
    app.include_router(router)