# trialsage/controllers/analytics_routes.py
from fastapi import APIRouter, HTTPException
from typing import Dict, Any
import psycopg2
import os
from datetime import datetime

router = APIRouter()

@router.get("/cohort-summary")
async def get_cohort_summary() -> Dict[str, Any]:
    """
    Get a summary of the current analytics cohort (CSRs, therapeutic areas, etc.)
    Used by the KnowledgeBasePanel component to display statistics
    """
    try:
        # Query actual CSR count from the database
        conn = psycopg2.connect(os.environ.get("DATABASE_URL"))
        cursor = conn.cursor()
        
        # Get total CSR count
        cursor.execute("SELECT COUNT(*) FROM csr_reports")
        total_csrs = cursor.fetchone()[0]
        
        # Get therapeutic areas count (unique indications)
        cursor.execute("SELECT COUNT(DISTINCT indication) FROM csr_reports WHERE indication IS NOT NULL")
        therapeutic_areas = cursor.fetchone()[0]
        
        # Close connection
        cursor.close()
        conn.close()
        
        return {
            "success": True,
            "total_csrs": total_csrs,  # Real count from database
            "therapeutic_areas": therapeutic_areas or 18,
            "design_patterns": 150,  # Still using hardcoded value for now
            "regulatory_signals": 42,  # Still using hardcoded value for now
            "timestamp": datetime.now().strftime("%Y-%m-%d")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting cohort summary: {str(e)}")

@router.post("/query")
async def process_analytics_query(query_data: Dict[str, Any]) -> Dict[str, Any]:
    """Process a natural language analytics query"""
    try:
        from trialsage.controllers.analytics import process_analytics_query
        
        return await process_analytics_query(
            query=query_data.get("query", ""),
            thread_id=query_data.get("thread_id")
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing analytics query: {str(e)}")

@router.post("/predict")
async def generate_prediction(prediction_data: Dict[str, Any]) -> Dict[str, Any]:
    """Generate prediction analysis for trial outcomes"""
    try:
        from trialsage.controllers.analytics import generate_prediction_analysis
        
        return await generate_prediction_analysis(
            indication=prediction_data.get("indication", ""),
            phase=prediction_data.get("phase"),
            sample_size=prediction_data.get("sample_size"),
            duration_weeks=prediction_data.get("duration_weeks"),
            endpoints=prediction_data.get("endpoints"),
            comparator=prediction_data.get("comparator"),
            thread_id=prediction_data.get("thread_id")
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating prediction: {str(e)}")

@router.get("/context")
async def get_analytics_context_data(
    indication: str = None,
    phase: str = None,
    thread_id: str = None
) -> Dict[str, Any]:
    """Get contextual data for analytics queries"""
    try:
        from trialsage.controllers.analytics import get_analytics_context
        
        filter_params = {}
        if indication or phase:
            filter_params = {"indication": indication, "phase": phase}
        
        return await get_analytics_context(
            indication=indication,
            phase=phase,
            filter_params=filter_params,
            thread_id=thread_id
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting analytics context: {str(e)}")

@router.post("/visualize")
async def generate_visualization_data(visualization_data: Dict[str, Any]) -> Dict[str, Any]:
    """Generate visualization data for analytics UI"""
    try:
        from trialsage.controllers.analytics import generate_visualization_data
        
        return await generate_visualization_data(
            visualization_type=visualization_data.get("type", "bar"),
            params=visualization_data.get("params", {}),
            thread_id=visualization_data.get("thread_id")
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating visualization: {str(e)}")

@router.get("/csr-drill/{study_id}")
async def get_csr_drill_details(
    study_id: str,
    section: str = None,
    thread_id: str = None
) -> Dict[str, Any]:
    """Get detailed CSR data for drill-down analysis"""
    try:
        from trialsage.controllers.analytics import get_csr_drill_details
        
        return await get_csr_drill_details(
            study_id=study_id,
            section=section,
            thread_id=thread_id
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving CSR details: {str(e)}")