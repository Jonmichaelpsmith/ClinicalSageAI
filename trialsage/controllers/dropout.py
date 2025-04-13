# /controllers/dropout.py
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class DropoutInput(BaseModel):
    duration_weeks: float
    control: str
    arms: int

@router.post("/api/analytics/dropout-estimate")
def estimate_dropout(input: DropoutInput):
    base_rate = 0.15

    # Adjust dropout prediction based on trial features
    if input.duration_weeks > 24:
        base_rate += 0.05
    elif input.duration_weeks < 12:
        base_rate -= 0.03

    if "placebo" in input.control.lower():
        base_rate += 0.04
    if input.arms > 3:
        base_rate += 0.02

    dropout_rate = round(min(max(base_rate, 0.05), 0.35), 3)

    rationale = [
        f"Baseline dropout: 15%",
        f"Duration: {input.duration_weeks} weeks → adjusted by ±{'+5%' if input.duration_weeks > 24 else '-3%' if input.duration_weeks < 12 else '0%'}",
        f"Control: {input.control} → +4% for placebo",
        f"Arms: {input.arms} → {'+2%' if input.arms > 3 else '0%'}"
    ]

    return {
        "dropout_rate": dropout_rate * 100,
        "reasoning": "\n".join(rationale)
    }