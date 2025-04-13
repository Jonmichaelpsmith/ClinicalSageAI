from fastapi import APIRouter
from pydantic import BaseModel
from trialsage.statistical_predictor import calculate_sample_size

router = APIRouter()

class SampleSizeInput(BaseModel):
    effect_size: float
    std_dev: float
    alpha: float = 0.05
    power: float = 0.8

@router.post("/api/analytics/sample-size")
def sample_size_calc(input: SampleSizeInput):
    result = calculate_sample_size(
        effect_size=input.effect_size,
        std_dev=input.std_dev,
        alpha=input.alpha,
        power=input.power
    )
    return result