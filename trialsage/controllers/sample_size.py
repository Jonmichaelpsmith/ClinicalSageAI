from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Optional, List
import logging

from trialsage.statistical_predictor import calculate_sample_size

# Create router
router = APIRouter()
logger = logging.getLogger(__name__)

# Define request models
class SampleSizeRequest(BaseModel):
    effect_size: float
    std_dev: float
    alpha: float = 0.05
    power: float = 0.8
    
class BinarySampleSizeRequest(BaseModel):
    p1: float  # proportion in control group
    p2: float  # proportion in treatment group
    alpha: float = 0.05
    power: float = 0.8
    ratio: float = 1.0
    dropout_rate: float = 0.0
    
class ContinuousSampleSizeRequest(BaseModel):
    mean1: float  # mean in control group
    mean2: float  # mean in treatment group
    std_dev: float
    alpha: float = 0.05
    power: float = 0.8
    ratio: float = 1.0
    dropout_rate: float = 0.0
    
class SurvivalSampleSizeRequest(BaseModel):
    hr: float  # hazard ratio
    event_rate1: float
    event_rate2: Optional[float] = None
    study_duration: float = 12
    follow_up_duration: float = 12
    alpha: float = 0.05
    power: float = 0.8
    ratio: float = 1.0
    dropout_rate: float = 0.0
    
class NonInferiorityBinaryRequest(BaseModel):
    p0: float  # expected proportion in both groups
    non_inferiority_margin: float
    alpha: float = 0.05
    power: float = 0.8
    ratio: float = 1.0
    dropout_rate: float = 0.0
    
class NonInferiorityContinuousRequest(BaseModel):
    std_dev: float
    non_inferiority_margin: float
    alpha: float = 0.05
    power: float = 0.8
    ratio: float = 1.0
    dropout_rate: float = 0.0
    
class RecommendationRequest(BaseModel):
    design_type: str
    indication: str
    phase: str
    parameters: Dict

# Define endpoints
@router.post("/sample-size")
async def get_sample_size(request: SampleSizeRequest):
    """
    Calculate sample size based on effect size, standard deviation, alpha, and power
    """
    try:
        result = calculate_sample_size(
            effect_size=request.effect_size,
            std_dev=request.std_dev,
            alpha=request.alpha,
            power=request.power
        )
        return result
    except Exception as e:
        logger.error(f"Error calculating sample size: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/sample-size/continuous")
async def get_continuous_sample_size(request: ContinuousSampleSizeRequest):
    """
    Calculate sample size for continuous outcomes (t-test, mean comparison)
    """
    try:
        from trialsage.statistical_predictor import StatisticalPredictor
        predictor = StatisticalPredictor()
        
        result = predictor.predict_sample_size_continuous(
            mean1=request.mean1,
            mean2=request.mean2,
            std_dev=request.std_dev,
            alpha=request.alpha,
            power=request.power,
            ratio=request.ratio,
            dropout_rate=request.dropout_rate
        )
        return result
    except Exception as e:
        logger.error(f"Error calculating continuous sample size: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/sample-size/binary")
async def get_binary_sample_size(request: BinarySampleSizeRequest):
    """
    Calculate sample size for binary outcomes (proportion comparison)
    """
    try:
        from trialsage.statistical_predictor import StatisticalPredictor
        predictor = StatisticalPredictor()
        
        result = predictor.predict_sample_size_binary(
            p1=request.p1,
            p2=request.p2,
            alpha=request.alpha,
            power=request.power,
            ratio=request.ratio,
            dropout_rate=request.dropout_rate
        )
        return result
    except Exception as e:
        logger.error(f"Error calculating binary sample size: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/sample-size/survival")
async def get_survival_sample_size(request: SurvivalSampleSizeRequest):
    """
    Calculate sample size for survival outcomes (time-to-event)
    """
    try:
        from trialsage.statistical_predictor import StatisticalPredictor
        predictor = StatisticalPredictor()
        
        result = predictor.predict_sample_size_survival(
            hr=request.hr,
            event_rate1=request.event_rate1,
            event_rate2=request.event_rate2,
            study_duration=request.study_duration,
            follow_up_duration=request.follow_up_duration,
            alpha=request.alpha,
            power=request.power,
            ratio=request.ratio,
            dropout_rate=request.dropout_rate
        )
        return result
    except Exception as e:
        logger.error(f"Error calculating survival sample size: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/sample-size/non-inferiority-binary")
async def get_non_inferiority_binary_sample_size(request: NonInferiorityBinaryRequest):
    """
    Calculate sample size for non-inferiority binary outcomes
    """
    try:
        from trialsage.statistical_predictor import StatisticalPredictor
        predictor = StatisticalPredictor()
        
        result = predictor.predict_sample_size_non_inferiority_binary(
            p0=request.p0,
            non_inferiority_margin=request.non_inferiority_margin,
            alpha=request.alpha,
            power=request.power,
            ratio=request.ratio,
            dropout_rate=request.dropout_rate
        )
        return result
    except Exception as e:
        logger.error(f"Error calculating non-inferiority binary sample size: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/sample-size/non-inferiority-continuous")
async def get_non_inferiority_continuous_sample_size(request: NonInferiorityContinuousRequest):
    """
    Calculate sample size for non-inferiority continuous outcomes
    """
    try:
        from trialsage.statistical_predictor import StatisticalPredictor
        predictor = StatisticalPredictor()
        
        result = predictor.predict_sample_size_non_inferiority_continuous(
            std_dev=request.std_dev,
            non_inferiority_margin=request.non_inferiority_margin,
            alpha=request.alpha,
            power=request.power,
            ratio=request.ratio,
            dropout_rate=request.dropout_rate
        )
        return result
    except Exception as e:
        logger.error(f"Error calculating non-inferiority continuous sample size: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/sample-size/recommend")
async def get_sample_size_recommendation(request: RecommendationRequest):
    """
    Generate intelligent sample size recommendations based on indication and phase
    """
    try:
        from trialsage.statistical_predictor import StatisticalPredictor
        predictor = StatisticalPredictor()
        
        result = predictor.recommend_sample_size(
            indication=request.indication,
            phase=request.phase,
            design_type=request.design_type,
            parameters=request.parameters
        )
        return result
    except Exception as e:
        logger.error(f"Error generating sample size recommendation: {e}")
        raise HTTPException(status_code=400, detail=str(e))