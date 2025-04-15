from pydantic import BaseModel
from typing import List, Dict, Optional

class PatientDemographics(BaseModel):
    """Model for patient demographic information in adverse events"""
    age_range: str
    gender_distribution: Dict[str, int]

class AdverseEvent(BaseModel):
    """Model for individual adverse events"""
    event: str
    count: int
    severity: str
    patient_demographics: PatientDemographics

class ClinicalSummary(BaseModel):
    """Model for clinical summary information in a CER"""
    benefit_risk: str
    efficacy_summary: str
    comparative_summary: str

class CERReport(BaseModel):
    """Model for a complete Clinical Evaluation Report"""
    product_name: str
    ndc_code: str
    adverse_events: List[AdverseEvent]
    clinical_summary: ClinicalSummary
    report_date: Optional[str] = None
    
class CERRequest(BaseModel):
    """Model for incoming CER generation requests"""
    ndc_code: str
    product_name: Optional[str] = None
    limit: Optional[int] = 100