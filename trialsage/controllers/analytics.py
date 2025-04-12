# /controllers/analytics.py
from typing import Dict, List, Any, Optional
from fastapi import HTTPException
from pydantic import BaseModel

from trialsage.services.analytics_engine import (
    process_query,
    generate_prediction,
    get_context_data,
    generate_visualization,
    get_csr_drill_data
)


async def process_analytics_query(query: str, thread_id: Optional[str] = None) -> Dict[str, Any]:
    """
    Process a natural language analytics query
    
    Args:
        query: The natural language query to process
        thread_id: Optional thread ID for conversation continuity
        
    Returns:
        dict: Contains the processed response with answer, visualization data, and context
    """
    try:
        # Process query through analytics engine
        result = await process_query(query, thread_id)
        
        # Add additional context from the query processing
        if not thread_id and result.get("thread_id"):
            thread_id = result.get("thread_id")
            
        return {
            "success": True,
            "query": query,
            "answer": result.get("answer", ""),
            "visualization": result.get("visualization", {}),
            "thread_id": thread_id,
            "insights": result.get("insights", []),
            "data_points": result.get("data_points", 0),
            "related_questions": result.get("related_questions", []),
            "context": result.get("context", {})
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing analytics query: {str(e)}")


async def generate_prediction_analysis(
    indication: str,
    phase: Optional[str] = None,
    sample_size: Optional[int] = None,
    duration_weeks: Optional[int] = None,
    endpoints: Optional[List[str]] = None,
    comparator: Optional[str] = None,
    thread_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Generate prediction analysis for trial outcomes
    
    Args:
        indication: The medical indication/condition for the prediction
        phase: Clinical trial phase (I, II, III, IV)
        sample_size: Number of patients in the trial
        duration_weeks: Duration of the trial in weeks
        endpoints: List of trial endpoints
        comparator: Comparator/control type (placebo, active, etc.)
        thread_id: Optional thread ID for conversation continuity
        
    Returns:
        dict: Contains prediction results, success probability, and confidence metrics
    """
    try:
        # Generate prediction through analytics engine
        prediction_result = await generate_prediction(
            indication=indication,
            phase=phase,
            sample_size=sample_size,
            duration_weeks=duration_weeks,
            endpoints=endpoints,
            comparator=comparator,
            thread_id=thread_id
        )
        
        return {
            "success": True,
            "indication": indication,
            "phase": phase,
            "prediction": prediction_result.get("prediction", {}),
            "success_probability": prediction_result.get("success_probability", 0.0),
            "confidence": prediction_result.get("confidence", 0.0),
            "similar_trials": prediction_result.get("similar_trials", []),
            "thread_id": prediction_result.get("thread_id", thread_id),
            "optimization_suggestions": prediction_result.get("optimization_suggestions", []),
            "risk_factors": prediction_result.get("risk_factors", [])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating prediction: {str(e)}")


async def get_analytics_context(
    indication: Optional[str] = None,
    phase: Optional[str] = None,
    filter_params: Optional[Dict[str, Any]] = None,
    thread_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Get contextual data for analytics queries
    
    Args:
        indication: Optional filter by indication
        phase: Optional filter by clinical trial phase
        filter_params: Additional filter parameters
        thread_id: Optional thread ID for conversation context
        
    Returns:
        dict: Contains contextual data for the current analytics session
    """
    try:
        # Get context data through analytics engine
        context_data = await get_context_data(
            indication=indication,
            phase=phase,
            filter_params=filter_params,
            thread_id=thread_id
        )
        
        return {
            "success": True,
            "context": context_data.get("context", {}),
            "available_filters": context_data.get("available_filters", {}),
            "summary_metrics": context_data.get("summary_metrics", {}),
            "thread_id": context_data.get("thread_id", thread_id),
            "cohort_size": context_data.get("cohort_size", 0),
            "timeframe": context_data.get("timeframe", {})
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting analytics context: {str(e)}")


async def generate_visualization_data(
    visualization_type: str,
    params: Dict[str, Any],
    thread_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Generate visualization data for analytics UI
    
    Args:
        visualization_type: Type of visualization (bar, line, scatter, heatmap, etc.)
        params: Parameters for the visualization
        thread_id: Optional thread ID for conversation context
        
    Returns:
        dict: Contains visualization data, labels, and insights
    """
    try:
        # Generate visualization through analytics engine
        visualization_data = await generate_visualization(
            visualization_type=visualization_type,
            params=params,
            thread_id=thread_id
        )
        
        return {
            "success": True,
            "visualization_type": visualization_type,
            "data": visualization_data.get("data", {}),
            "labels": visualization_data.get("labels", {}),
            "insights": visualization_data.get("insights", []),
            "thread_id": visualization_data.get("thread_id", thread_id),
            "title": visualization_data.get("title", ""),
            "subtitle": visualization_data.get("subtitle", ""),
            "axis_labels": visualization_data.get("axis_labels", {})
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating visualization: {str(e)}")


async def get_csr_drill_details(
    study_id: str,
    section: Optional[str] = None,
    thread_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Get detailed CSR data for drill-down analysis
    
    Args:
        study_id: The ID of the study to drill into
        section: Optional specific section to retrieve (endpoints, adverse_events, etc.)
        thread_id: Optional thread ID for conversation context
        
    Returns:
        dict: Contains detailed CSR data for analysis
    """
    try:
        # Get CSR drill data through analytics engine
        drill_data = await get_csr_drill_data(
            study_id=study_id,
            section=section,
            thread_id=thread_id
        )
        
        return {
            "success": True,
            "study_id": study_id,
            "section": section,
            "title": drill_data.get("title", ""),
            "sponsor": drill_data.get("sponsor", ""),
            "indication": drill_data.get("indication", ""),
            "phase": drill_data.get("phase", ""),
            "data": drill_data.get("data", {}),
            "insights": drill_data.get("insights", []),
            "thread_id": drill_data.get("thread_id", thread_id),
            "similar_studies": drill_data.get("similar_studies", []),
            "citations": drill_data.get("citations", [])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving CSR details: {str(e)}")