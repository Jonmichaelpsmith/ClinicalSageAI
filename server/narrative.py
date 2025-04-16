import os
import openai
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel

from ingestion.fda_faers import get_faers_cached
from ingestion.fda_device import get_device_complaints_cached
from ingestion.eu_eudamed import get_eudamed_cached
from ingestion.normalize import normalize_faers, normalize_maude, normalize_eudamed
from predictive_analytics import aggregate_time_series, forecast_adverse_events, detect_anomalies

# Ensure your OPENAI_API_KEY is set in environment
env_key = "OPENAI_API_KEY"
if not os.getenv(env_key):
    print(f"Warning: {env_key} environment variable is not set, narrative generation will fail")
openai.api_key = os.getenv(env_key)

def build_faers_analysis(ndc_code: str, periods: int = 3) -> Dict[str, Any]:
    """
    Build analysis for FAERS (drug) data.
    
    Args:
        ndc_code: NDC product code or drug name 
        periods: Number of periods to forecast ahead
        
    Returns:
        dict with source, product_code, total_count, trend, forecast, anomalies
    """
    # Get and normalize data
    raw = get_faers_cached(ndc_code)
    normalized = normalize_faers(raw, ndc_code)
    
    # Build time series
    series = aggregate_time_series(normalized)
    
    # Compute forecasts & anomalies
    forecast = forecast_adverse_events(series, periods=periods)
    anomalies = detect_anomalies(series)
    
    # Calculate counts
    total = sum(rec.get("count", 0) for rec in normalized)
    serious_count = sum(1 for rec in normalized if rec.get("serious", False))
    
    # Get top event descriptions
    event_counts = {}
    for rec in normalized:
        desc = rec.get("description", "")
        if desc:
            event_counts[desc] = event_counts.get(desc, 0) + rec.get("count", 1)
    
    top_events = sorted(event_counts.items(), key=lambda x: x[1], reverse=True)[:5]
    
    return {
        "source": "FAERS",
        "product_code": ndc_code,
        "total_count": total,
        "serious_count": serious_count,
        "trend": {str(idx.date()): int(val) for idx, val in series.items()},
        "forecast": forecast,
        "anomalies": anomalies,
        "top_events": dict(top_events)
    }

def build_device_analysis(device_code: str, periods: int = 3) -> Dict[str, Any]:
    """
    Build analysis for MAUDE (device) data.
    
    Args:
        device_code: Device identifier or name
        periods: Number of periods to forecast ahead
        
    Returns:
        dict with source, product_code, total_count, trend, forecast, anomalies
    """
    # Get and normalize data
    raw = get_device_complaints_cached(device_code)
    normalized = normalize_maude(raw, device_code)
    
    # Build time series
    series = aggregate_time_series(normalized)
    
    # Compute forecasts & anomalies
    forecast = forecast_adverse_events(series, periods=periods)
    anomalies = detect_anomalies(series)
    
    # Calculate counts
    total = sum(rec.get("count", 0) for rec in normalized)
    serious_count = sum(1 for rec in normalized if rec.get("serious", False))
    
    # Get top event descriptions
    event_counts = {}
    for rec in normalized:
        desc = rec.get("description", "")
        if desc:
            event_counts[desc] = event_counts.get(desc, 0) + rec.get("count", 1)
    
    top_events = sorted(event_counts.items(), key=lambda x: x[1], reverse=True)[:5]
    
    return {
        "source": "MAUDE",
        "product_code": device_code,
        "total_count": total,
        "serious_count": serious_count,
        "trend": {str(idx.date()): int(val) for idx, val in series.items()},
        "forecast": forecast,
        "anomalies": anomalies,
        "top_events": dict(top_events)
    }

def build_eudamed_analysis(product_code: str) -> Dict[str, Any]:
    """
    Creates a simple analysis from Eudamed stub data
    
    Args:
        product_code: Product code to query in Eudamed
        
    Returns:
        Basic Eudamed analysis info 
    """
    # Get Eudamed data (currently a stub)
    raw = get_eudamed_cached(product_code)
    normalized = normalize_eudamed(raw, product_code)
    
    # Extract available data
    message = raw.get("message", "No Eudamed data available")
    
    return {
        "source": "Eudamed",
        "product_code": product_code,
        "message": message,
        "records": normalized
    }

def build_multi_analysis(ndc_codes: List[str] = None, device_codes: List[str] = None, periods: int = 3) -> Dict[str, Any]:
    """
    Combine analyses across FAERS, MAUDE, and optional Eudamed stubs.
    
    Args:
        ndc_codes: List of NDC codes for drugs
        device_codes: List of device identifiers
        periods: Number of periods to forecast
        
    Returns:
        Combined dict of analyses from all sources
    """
    analyses = []
    
    # Add drug analyses
    if ndc_codes:
        for ndc in ndc_codes:
            analyses.append(build_faers_analysis(ndc, periods))
    
    # Add device analyses
    if device_codes:
        for device in device_codes:
            analyses.append(build_device_analysis(device, periods))
            # Also include Eudamed data for devices
            analyses.append(build_eudamed_analysis(device))
    
    return {"analyses": analyses}

def generate_cer_narrative_from_analysis(analysis_data: Dict[str, Any]) -> str:
    """
    Generate CER narrative from multi-source analysis data.
    
    Args:
        analysis_data: Dict with analyses array or single analysis
        
    Returns:
        Generated CER narrative text
    """
    # Check if we have a multi-source analysis or single source
    if "analyses" in analysis_data:
        # Multi-source analysis - build clean prompt lines
        prompt_lines = []
        
        for item in analysis_data.get("analyses", []):
            source = item.get("source", "Unknown")
            code = item.get("product_code", "Unknown")
            
            if source in ["FAERS", "MAUDE"]:
                # Drug or device data
                total = item.get("total_count", 0)
                serious = item.get("serious_count", 0)
                top_events = item.get("top_events", {})
                trend = item.get("trend", {})
                forecast = item.get("forecast", {})
                anomalies = item.get("anomalies", {})
                
                top_events_str = ", ".join([f"{event} ({count})" for event, count in top_events.items()])
                trend_str = ", ".join([f"{date}: {count}" for date, count in trend.items()])
                forecast_str = ", ".join([f"{date}: {count}" for date, count in forecast.items()])
                anomalies_str = ", ".join([f"{date}: {count}" for date, count in anomalies.items()])
                
                line = (f"Source: {source}, Code: {code}, " +
                       f"Total: {total}, Serious: {serious}, " +
                       f"Top Events: {top_events_str}, " +
                       f"Trend: {trend_str}, " +
                       f"Forecast: {forecast_str}, " +
                       f"Anomalies: {anomalies_str}")
                prompt_lines.append(line)
                
            elif source == "Eudamed":
                # Eudamed data (stub)
                message = item.get("message", "")
                records = item.get("records", [])
                line = f"Source: {source}, Code: {code}, Info: {message}, Records: {records}"
                prompt_lines.append(line)
        
        # Build the complete prompt
        prompt = (
            "You are a regulatory-compliant Clinical Evaluation Report (CER) generator. "
            "Based on the following multi-source analysis data, generate a cohesive CER narrative "
            "that includes an executive summary, trends, forecasts, anomaly analysis, and benefit-risk considerations.\n\n"
            + "\n".join(prompt_lines) +
            "\n\nPlease include in your CER narrative:\n"
            "1. Executive summary of the combined safety profile\n"
            "2. Analysis of trends across all sources\n"
            "3. Forecast interpretation and risk assessment\n"
            "4. Analysis of any detected anomalies\n"
            "5. Benefit-risk considerations\n\n"
            "Provide a cohesive, professional narrative suitable for regulatory submission."
        )
    else:
        # Single source analysis (FAERS or MAUDE)
        item = analysis_data
        source = item.get("source", "Unknown")
        code = item.get("product_code", "Unknown")
        total = item.get("total_count", 0)
        serious = item.get("serious_count", 0)
        top_events = item.get("top_events", {})
        trend = item.get("trend", {})
        forecast = item.get("forecast", {})
        anomalies = item.get("anomalies", {})
        
        top_events_str = ", ".join([f"{event} ({count})" for event, count in top_events.items()])
        trend_str = ", ".join([f"{date}: {count}" for date, count in trend.items()])
        forecast_str = ", ".join([f"{date}: {count}" for date, count in forecast.items()])
        anomalies_str = ", ".join([f"{date}: {count}" for date, count in anomalies.items()])
        
        prompt = f"""
You are a regulatory-compliant Clinical Evaluation Report (CER) generator.

Generate a detailed CER narrative based on the following {source} analysis data:

Product Code: {code}
Total Reports: {total}
Serious Events: {serious}
Top Reported Events: {top_events_str}

Trend (monthly counts): {trend_str}
Forecast (next periods): {forecast_str}
Anomalies detected: {anomalies_str}

Please include:
- An executive summary
- Description of trends 
- Forecast interpretation
- Analysis of anomalies
- Benefit-risk considerations

Provide a cohesive, professional narrative suitable for regulatory submission.
"""

    try:
        # Generate the narrative with OpenAI
        response = openai.chat.completions.create(
            model="gpt-4-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            max_tokens=800
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error generating CER narrative: {e}")
        # Fall back to a simple narrative if OpenAI fails
        if "analyses" in analysis_data:
            return f"Clinical Evaluation Report: Combined analysis of multiple regulatory sources. Due to the complexity of the data, a comprehensive narrative could not be generated. Please review the raw analysis data."
        else:
            return f"Clinical Evaluation Report for {code}: Analysis of {total} adverse event reports, including {serious} serious events from {source}. Data trends and forecasting suggest continued monitoring is warranted."

# FastAPI Router Integration
router = APIRouter(prefix="/api/narrative", tags=["narrative"])

@router.get("/faers/{ndc_code}")
async def narrative_faers(ndc_code: str, periods: int = 3):
    """
    Generate a CER narrative for a drug based on FAERS data
    
    Args:
        ndc_code: NDC product code or drug name
        periods: Number of periods to forecast (default: 3)
        
    Returns:
        Dictionary with product_code, analysis data, and generated narrative
    """
    try:
        # Check if OpenAI API key is available
        if not openai.api_key:
            raise ValueError("OPENAI_API_KEY environment variable is not set")
        
        # Build analysis and generate narrative
        analysis = build_faers_analysis(ndc_code, periods)
        narrative = generate_cer_narrative_from_analysis(analysis)
        
        # Return both the analysis data and the narrative
        return {
            "product_code": ndc_code,
            "source": "FAERS",
            "analysis": analysis,
            "narrative": narrative
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"FAERS narrative failed: {str(e)}")

@router.get("/device/{device_code}")
async def narrative_device(device_code: str, periods: int = 3):
    """
    Generate a CER narrative for a device based on MAUDE data
    
    Args:
        device_code: Device identifier or name
        periods: Number of periods to forecast (default: 3)
        
    Returns:
        Dictionary with product_code, analysis data, and generated narrative
    """
    try:
        # Check if OpenAI API key is available
        if not openai.api_key:
            raise ValueError("OPENAI_API_KEY environment variable is not set")
        
        # Build analysis and generate narrative
        analysis = build_device_analysis(device_code, periods)
        narrative = generate_cer_narrative_from_analysis(analysis)
        
        # Return both the analysis data and the narrative
        return {
            "product_code": device_code,
            "source": "MAUDE",
            "analysis": analysis,
            "narrative": narrative
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Device narrative failed: {str(e)}")

class MultiRequest(BaseModel):
    ndc_codes: Optional[List[str]] = None
    device_codes: Optional[List[str]] = None
    periods: int = 3

@router.post("/multi")
async def narrative_multi(request: MultiRequest = Body(...)):
    """
    Generate a comprehensive CER narrative from multiple regulatory sources
    
    Args:
        request: MultiRequest with ndc_codes, device_codes, and periods
        
    Returns:
        Dictionary with analysis data and generated narrative
    """
    try:
        # Check if OpenAI API key is available
        if not openai.api_key:
            raise ValueError("OPENAI_API_KEY environment variable is not set")
            
        # Validate request
        if not request.ndc_codes and not request.device_codes:
            raise ValueError("At least one NDC code or device code must be provided")
            
        # Build combined analysis
        analysis_data = build_multi_analysis(
            ndc_codes=request.ndc_codes,
            device_codes=request.device_codes,
            periods=request.periods
        )
        
        # Generate narrative
        narrative = generate_cer_narrative_from_analysis(analysis_data)
        
        # Return analysis and narrative
        return {
            "sources": {
                "FAERS": len(request.ndc_codes) if request.ndc_codes else 0,
                "MAUDE": len(request.device_codes) if request.device_codes else 0,
                "Eudamed": len(request.device_codes) if request.device_codes else 0
            },
            "analysis": analysis_data,
            "narrative": narrative
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Multi-source narrative failed: {str(e)}")