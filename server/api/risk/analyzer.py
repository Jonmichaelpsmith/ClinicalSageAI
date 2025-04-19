"""
Risk Analyzer API

This module provides API endpoints for analyzing submission risks based on QC and validator results.
"""
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from typing import Dict, List, Any, Optional
import logging
import json
from datetime import datetime

from server.utils.risk_analyzer import (
    evaluate_qc_results,
    evaluate_validator_results,
    generate_ai_risk_analysis,
    analyze_submission_risks
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize router
router = APIRouter()

@router.get("/api/risk/regions")
async def get_supported_regions():
    """Get a list of supported regulatory regions"""
    return {
        "regions": [
            {"id": "FDA", "name": "US Food and Drug Administration", "country": "USA"},
            {"id": "EMA", "name": "European Medicines Agency", "country": "EU"},
            {"id": "PMDA", "name": "Pharmaceuticals and Medical Devices Agency", "country": "Japan"}
        ]
    }

@router.post("/api/risk/analyze_qc")
async def analyze_qc_results(data: Dict[str, Any]):
    """
    Analyze QC results to identify risks
    
    Args:
        data: Dictionary containing:
            - qc_results: List of QC result dictionaries
            - region: Regulatory region (FDA, EMA, PMDA)
            
    Returns:
        Dictionary with risk assessment
    """
    try:
        qc_results = data.get("qc_results", [])
        region = data.get("region", "FDA")
        
        if not qc_results:
            return {"error": "No QC results provided", "risk_level": "LOW"}
        
        assessment = evaluate_qc_results(qc_results, region)
        return assessment
    except Exception as e:
        logger.error(f"Error analyzing QC results: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error analyzing QC results: {str(e)}"
        )

@router.post("/api/risk/analyze_validator")
async def analyze_validator_results(data: Dict[str, Any]):
    """
    Analyze eValidator results to identify risks
    
    Args:
        data: Dictionary containing:
            - validator_results: eValidator result dictionary
            - region: Regulatory region (FDA, EMA, PMDA)
            
    Returns:
        Dictionary with risk assessment
    """
    try:
        validator_results = data.get("validator_results", {"categories": {}})
        region = data.get("region", "FDA")
        
        assessment = evaluate_validator_results(validator_results, region)
        return assessment
    except Exception as e:
        logger.error(f"Error analyzing validator results: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error analyzing validator results: {str(e)}"
        )

@router.post("/api/risk/analyze_submission")
async def analyze_submission(data: Dict[str, Any], background_tasks: BackgroundTasks):
    """
    Comprehensive analysis of submission risks
    
    Args:
        data: Dictionary containing:
            - submission_id: ID of the submission
            - qc_results: Optional QC results
            - validator_results: Optional validator results
            - region: Regulatory region (FDA, EMA, PMDA)
            
    Returns:
        Dictionary with quick assessment and task ID for detailed analysis
    """
    try:
        submission_id = data.get("submission_id")
        if not submission_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="submission_id is required"
            )
        
        qc_results = data.get("qc_results", [])
        validator_results = data.get("validator_results", {"categories": {}})
        region = data.get("region", "FDA")
        
        # Generate quick assessment
        qc_assessment = evaluate_qc_results(qc_results, region)
        validator_assessment = evaluate_validator_results(validator_results, region)
        
        # Determine initial risk level
        combined_risk_level = "LOW"
        if qc_assessment["risk_level"] == "HIGH" or validator_assessment["risk_level"] == "HIGH":
            combined_risk_level = "HIGH"
        elif qc_assessment["risk_level"] == "MEDIUM" or validator_assessment["risk_level"] == "MEDIUM":
            combined_risk_level = "MEDIUM"
        
        # Generate task ID for tracking
        task_id = f"risk-{submission_id}-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
        
        # Schedule detailed analysis in background
        background_tasks.add_task(
            _run_detailed_analysis,
            task_id,
            submission_id,
            qc_results,
            validator_results,
            region
        )
        
        return {
            "task_id": task_id,
            "initial_assessment": {
                "risk_level": combined_risk_level,
                "qc_issues": qc_assessment["issue_counts"],
                "validator_issues": validator_assessment["issue_counts"],
                "region": region
            },
            "status": "processing"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error initiating submission analysis: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error initiating submission analysis: {str(e)}"
        )

@router.get("/api/risk/{task_id}")
async def get_risk_analysis(task_id: str):
    """
    Get risk analysis results by task ID
    
    Args:
        task_id: Task ID from analyze_submission
        
    Returns:
        Dictionary with risk assessment or status
    """
    try:
        # TODO: Fetch from database or cache
        result_path = f"/tmp/{task_id}.json"
        import os
        if not os.path.exists(result_path):
            return {"status": "processing", "task_id": task_id}
        
        with open(result_path, "r") as f:
            result = json.load(f)
        
        return result
    except Exception as e:
        logger.error(f"Error fetching risk analysis: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching risk analysis: {str(e)}"
        )

@router.post("/api/risk/analyze_ai")
async def analyze_with_ai(data: Dict[str, Any]):
    """
    Generate AI analysis of submission risks
    
    Args:
        data: Dictionary containing:
            - qc_assessment: QC risk assessment
            - validator_assessment: Validator risk assessment
            - region: Regulatory region (FDA, EMA, PMDA)
            
    Returns:
        Dictionary with AI risk assessment
    """
    try:
        qc_assessment = data.get("qc_assessment", {})
        validator_assessment = data.get("validator_assessment", {})
        region = data.get("region", "FDA")
        
        if not qc_assessment or not validator_assessment:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Both qc_assessment and validator_assessment are required"
            )
        
        ai_assessment = await generate_ai_risk_analysis(qc_assessment, validator_assessment, region)
        return ai_assessment
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating AI risk analysis: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating AI risk analysis: {str(e)}"
        )

async def _run_detailed_analysis(task_id, submission_id, qc_results, validator_results, region):
    """
    Background task to run detailed analysis and save results
    """
    try:
        # Run the comprehensive analysis
        result = await analyze_submission_risks(
            submission_id=submission_id,
            qc_results=qc_results,
            validator_results=validator_results,
            region=region
        )
        
        # Save result to temporary storage
        # In production, this would save to a database
        with open(f"/tmp/{task_id}.json", "w") as f:
            json.dump(result, f)
            
        logger.info(f"Completed detailed analysis for task {task_id}")
    except Exception as e:
        logger.error(f"Error in background analysis task {task_id}: {e}")
        # Save error status
        with open(f"/tmp/{task_id}.json", "w") as f:
            json.dump({
                "status": "error",
                "task_id": task_id,
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }, f)