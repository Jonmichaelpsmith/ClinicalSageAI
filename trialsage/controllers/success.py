# /controllers/success.py
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class TrialFeatures(BaseModel):
    phase: int
    indication: str
    arms: int
    duration_weeks: float
    control: str
    has_biomarker: bool = False

@router.post("/api/analytics/success-probability")
def predict_trial_success(features: TrialFeatures):
    score = 0.65  # start with neutral baseline

    # Phase adjustment
    if features.phase == 1:
        score -= 0.15
    elif features.phase == 3:
        score += 0.1

    # Indication heuristic
    if features.indication.lower() in ["nash", "alzheimers", "glioblastoma"]:
        score -= 0.1  # historically lower success rate

    # Biomarker bonus
    if features.has_biomarker:
        score += 0.1

    # Control arm complexity
    if features.control.lower() == "placebo":
        score += 0.05
    elif features.control.lower() in ["historical", "open label"]:
        score -= 0.05

    # Duration risk adjustment
    if features.duration_weeks > 36:
        score -= 0.05

    score = max(min(score, 0.95), 0.1)  # constrain to 10–95%

    return {
        "success_probability": round(score * 100, 1),
        "verdict": (
            "High likelihood of success" if score > 0.75 else
            "Moderate" if score >= 0.55 else
            "Low likelihood — review recommended"
        )
    }