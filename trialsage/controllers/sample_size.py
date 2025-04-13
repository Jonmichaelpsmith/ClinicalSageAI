"""
Sample Size Calculator Controller

This module provides FastAPI routes for sample size calculation functions.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional, List
from trialsage.sample_size_calculator import (
    calculate_power_continuous,
    calculate_power_binary,
    calculate_power_survival,
    calculate_non_inferiority_binary,
    calculate_non_inferiority_continuous,
    recommend_sample_size
)

router = APIRouter()


class ContinuousParams(BaseModel):
    mean1: float = Field(..., description="Mean of group 1")
    mean2: float = Field(..., description="Mean of group 2")
    std_dev: float = Field(..., description="Pooled standard deviation")
    power: float = Field(0.8, description="Statistical power (default: 0.8)")
    alpha: float = Field(0.05, description="Significance level (default: 0.05)")
    ratio: float = Field(1.0, description="Allocation ratio between groups (default: 1.0)")
    dropout_rate: float = Field(0.15, description="Expected dropout rate (default: 0.15)")


class BinaryParams(BaseModel):
    p1: float = Field(..., description="Proportion in group 1")
    p2: float = Field(..., description="Proportion in group 2")
    power: float = Field(0.8, description="Statistical power (default: 0.8)")
    alpha: float = Field(0.05, description="Significance level (default: 0.05)")
    ratio: float = Field(1.0, description="Allocation ratio between groups (default: 1.0)")
    dropout_rate: float = Field(0.15, description="Expected dropout rate (default: 0.15)")


class SurvivalParams(BaseModel):
    hr: float = Field(..., description="Hazard ratio (treatment vs control)")
    event_rate1: float = Field(..., description="Event rate in control group")
    event_rate2: Optional[float] = Field(None, description="Event rate in treatment group (calculated from HR if not provided)")
    study_duration: float = Field(12, description="Duration of study in months (default: 12)")
    follow_up_duration: float = Field(12, description="Duration of follow-up in months (default: 12)")
    power: float = Field(0.8, description="Statistical power (default: 0.8)")
    alpha: float = Field(0.05, description="Significance level (default: 0.05)")
    ratio: float = Field(1.0, description="Allocation ratio between groups (default: 1.0)")
    dropout_rate: float = Field(0.15, description="Expected dropout rate (default: 0.15)")


class NonInferiorityBinaryParams(BaseModel):
    p0: float = Field(..., description="Expected proportion in both groups")
    non_inferiority_margin: float = Field(..., description="Non-inferiority margin (delta)")
    power: float = Field(0.8, description="Statistical power (default: 0.8)")
    alpha: float = Field(0.05, description="Significance level (default: 0.05)")
    ratio: float = Field(1.0, description="Allocation ratio between groups (default: 1.0)")
    dropout_rate: float = Field(0.15, description="Expected dropout rate (default: 0.15)")


class NonInferiorityContinuousParams(BaseModel):
    std_dev: float = Field(..., description="Expected standard deviation in both groups")
    non_inferiority_margin: float = Field(..., description="Non-inferiority margin (delta)")
    power: float = Field(0.8, description="Statistical power (default: 0.8)")
    alpha: float = Field(0.05, description="Significance level (default: 0.05)")
    ratio: float = Field(1.0, description="Allocation ratio between groups (default: 1.0)")
    dropout_rate: float = Field(0.15, description="Expected dropout rate (default: 0.15)")


class RecommendationParams(BaseModel):
    design_type: str = Field(..., description="Type of study design")
    indication: str = Field(..., description="Disease/condition under study")
    phase: str = Field(..., description="Clinical trial phase")
    parameters: Dict[str, Any] = Field(..., description="Parameters for sample size calculation")


@router.post("/api/sample-size/continuous")
async def calculate_continuous_sample_size(params: ContinuousParams):
    """Calculate sample size for continuous outcomes (e.g., t-test)"""
    result = calculate_power_continuous(
        mean1=params.mean1,
        mean2=params.mean2,
        std_dev=params.std_dev,
        power=params.power,
        alpha=params.alpha,
        ratio=params.ratio
    )
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    # Add dropout adjustment
    adjusted_n = int(result["total_sample_size"] / (1 - params.dropout_rate))
    result["adjusted_sample_size"] = adjusted_n
    result["dropout_rate"] = params.dropout_rate
    
    return result


@router.post("/api/sample-size/binary")
async def calculate_binary_sample_size(params: BinaryParams):
    """Calculate sample size for binary outcomes (e.g., proportions test)"""
    result = calculate_power_binary(
        p1=params.p1,
        p2=params.p2,
        power=params.power,
        alpha=params.alpha,
        ratio=params.ratio
    )
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    # Add dropout adjustment
    adjusted_n = int(result["total_sample_size"] / (1 - params.dropout_rate))
    result["adjusted_sample_size"] = adjusted_n
    result["dropout_rate"] = params.dropout_rate
    
    return result


@router.post("/api/sample-size/survival")
async def calculate_survival_sample_size(params: SurvivalParams):
    """Calculate sample size for survival/time-to-event outcomes"""
    result = calculate_power_survival(
        hr=params.hr,
        event_rate1=params.event_rate1,
        event_rate2=params.event_rate2,
        study_duration=params.study_duration,
        follow_up_duration=params.follow_up_duration,
        power=params.power,
        alpha=params.alpha,
        ratio=params.ratio
    )
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    # Add dropout adjustment
    adjusted_n = int(result["total_sample_size"] / (1 - params.dropout_rate))
    result["adjusted_sample_size"] = adjusted_n
    result["dropout_rate"] = params.dropout_rate
    
    return result


@router.post("/api/sample-size/non-inferiority-binary")
async def calculate_non_inferiority_binary_sample_size(params: NonInferiorityBinaryParams):
    """Calculate sample size for non-inferiority trial with binary outcome"""
    result = calculate_non_inferiority_binary(
        p0=params.p0,
        non_inferiority_margin=params.non_inferiority_margin,
        power=params.power,
        alpha=params.alpha,
        ratio=params.ratio
    )
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    # Add dropout adjustment
    adjusted_n = int(result["total_sample_size"] / (1 - params.dropout_rate))
    result["adjusted_sample_size"] = adjusted_n
    result["dropout_rate"] = params.dropout_rate
    
    return result


@router.post("/api/sample-size/non-inferiority-continuous")
async def calculate_non_inferiority_continuous_sample_size(params: NonInferiorityContinuousParams):
    """Calculate sample size for non-inferiority trial with continuous outcome"""
    result = calculate_non_inferiority_continuous(
        std_dev=params.std_dev,
        non_inferiority_margin=params.non_inferiority_margin,
        power=params.power,
        alpha=params.alpha,
        ratio=params.ratio
    )
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    # Add dropout adjustment
    adjusted_n = int(result["total_sample_size"] / (1 - params.dropout_rate))
    result["adjusted_sample_size"] = adjusted_n
    result["dropout_rate"] = params.dropout_rate
    
    return result


@router.post("/api/sample-size/recommend")
async def get_sample_size_recommendation(params: RecommendationParams):
    """Provide recommendations for sample size based on protocol details"""
    result = recommend_sample_size(
        design_type=params.design_type,
        indication=params.indication,
        phase=params.phase,
        parameters=params.parameters
    )
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return result