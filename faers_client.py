"""
FDA FAERS Data Client

This module provides functions to retrieve adverse event data from the FDA FAERS API.
"""

import requests
import json
from typing import Dict, Any, List

FAERS_API_URL = "https://api.fda.gov/drug/event.json"

def clean_ndc_code(ndc_code: str) -> str:
    """
    Clean and standardize NDC code format by removing hyphens.
    
    Args:
        ndc_code: National Drug Code in various formats
        
    Returns:
        Standardized NDC code without hyphens
    """
    return ndc_code.replace("-", "")

def get_faers_data(ndc_code: str, limit: int = 100) -> Dict[str, Any]:
    """
    Retrieve adverse event reports for a specific drug by NDC code.
    
    Args:
        ndc_code: National Drug Code for the drug
        limit: Maximum number of records to retrieve (default 100)
        
    Returns:
        Dictionary containing FAERS data for the specified drug
    """
    try:
        # Standardize NDC code format
        clean_code = clean_ndc_code(ndc_code)
        
        # Make request to FDA FAERS API
        response = requests.get(
            f'{FAERS_API_URL}?search=openfda.product_ndc:"{clean_code}"&limit={limit}'
        )
        response.raise_for_status()
        data = response.json()
        
        # Process and restructure the response
        meta = {
            "disclaimer": data.get("meta", {}).get("disclaimer", ""),
            "license": data.get("meta", {}).get("license", ""),
            "last_updated": data.get("meta", {}).get("last_updated", ""),
            "results": {
                "total": data.get("meta", {}).get("results", {}).get("total", 0),
                "limit": limit
            }
        }
        
        # Extract drug info from first result if available
        drug_info = {}
        if data.get("results") and len(data["results"]) > 0:
            openfda = data["results"][0].get("patient", {}).get("drug", [{}])[0].get("openfda", {})
            drug_info = {
                "brand_name": ", ".join(openfda.get("brand_name", [])) if openfda.get("brand_name") else "",
                "generic_name": ", ".join(openfda.get("generic_name", [])) if openfda.get("generic_name") else "",
                "manufacturer": ", ".join(openfda.get("manufacturer_name", [])) if openfda.get("manufacturer_name") else "",
                "substance_name": ", ".join(openfda.get("substance_name", [])) if openfda.get("substance_name") else "",
                "product_type": ", ".join(openfda.get("product_type", [])) if openfda.get("product_type") else ""
            }
        
        # Process each report
        results = []
        for report in data.get("results", []):
            processed_report = {
                "report_id": report.get("safetyreportid", ""),
                "report_date": report.get("receiptdate", ""),
                "seriousness": extract_seriousness(report),
                "patient": extract_patient_data(report.get("patient", {})),
                "reactions": extract_reactions(report.get("patient", {})),
                "drug_role": extract_drug_role(report, ndc_code)
            }
            results.append(processed_report)
        
        return {
            "ndc_code": ndc_code,
            "meta": meta,
            "drug_info": drug_info,
            "results": results
        }
    
    except requests.exceptions.RequestException as e:
        return {
            "error": f"Error retrieving FAERS data: {str(e)}",
            "ndc_code": ndc_code
        }

def extract_drug_info(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Extract drug information from FAERS data.
    
    Args:
        data: Raw FAERS data
        
    Returns:
        Dictionary with drug information
    """
    drug_info = {}
    
    if data.get("results") and len(data["results"]) > 0:
        openfda = data["results"][0].get("patient", {}).get("drug", [{}])[0].get("openfda", {})
        drug_info = {
            "brand_name": ", ".join(openfda.get("brand_name", [])) if openfda.get("brand_name") else "",
            "generic_name": ", ".join(openfda.get("generic_name", [])) if openfda.get("generic_name") else "",
            "manufacturer": ", ".join(openfda.get("manufacturer_name", [])) if openfda.get("manufacturer_name") else "",
            "substance_name": ", ".join(openfda.get("substance_name", [])) if openfda.get("substance_name") else "",
            "product_type": ", ".join(openfda.get("product_type", [])) if openfda.get("product_type") else ""
        }
    
    return drug_info

def extract_patient_data(patient_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Extract patient demographic information.
    
    Args:
        patient_data: Patient section of FAERS report
        
    Returns:
        Dictionary with patient demographics
    """
    # Get age information
    age = None
    age_unit = None
    
    if "patientonsetage" in patient_data:
        age = patient_data["patientonsetage"]
        age_unit = patient_data.get("patientonsetageunit", "")
    
    # Get weight information
    weight = None
    weight_unit = None
    
    if "patientweight" in patient_data:
        weight = patient_data["patientweight"]
        weight_unit = "kg"  # FAERS uses kg for weight
    
    # Get sex information
    sex_mapping = {
        "1": "Male",
        "2": "Female",
        "0": "Unknown"
    }
    sex = sex_mapping.get(patient_data.get("patientsex", "0"), "Unknown")
    
    return {
        "age": age,
        "age_unit": age_unit,
        "weight": weight,
        "weight_unit": weight_unit,
        "sex": sex
    }

def extract_reactions(patient_data: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Extract adverse reaction information.
    
    Args:
        patient_data: Patient section of FAERS report
        
    Returns:
        List of reactions with details
    """
    reactions = []
    
    for reaction in patient_data.get("reaction", []):
        reactions.append({
            "term": reaction.get("reactionmeddrapt", "Unknown"),
            "outcome": reaction.get("reactionoutcome", "")
        })
    
    return reactions

def extract_drug_role(report: Dict[str, Any], target_ndc: str) -> str:
    """
    Determine if the drug of interest was a suspect drug or concomitant.
    
    Args:
        report: FAERS report data
        target_ndc: NDC code of the drug of interest
        
    Returns:
        String indicating drug role (Suspect, Concomitant, or Unknown)
    """
    clean_target_ndc = clean_ndc_code(target_ndc)
    
    for drug in report.get("patient", {}).get("drug", []):
        if drug.get("openfda", {}).get("product_ndc", []):
            for ndc in drug.get("openfda", {}).get("product_ndc", []):
                if clean_ndc_code(ndc) == clean_target_ndc:
                    role_code = drug.get("drugcharacterization", "")
                    if role_code == "1":
                        return "Suspect"
                    elif role_code == "2":
                        return "Concomitant"
    
    return "Unknown"

def extract_seriousness(report: Dict[str, Any]) -> Dict[str, bool]:
    """
    Extract serious adverse event flags.
    
    Args:
        report: FAERS report data
        
    Returns:
        Dictionary with seriousness indicators
    """
    seriousness = {
        "death": False,
        "life_threatening": False,
        "hospitalization": False,
        "disability": False,
        "congenital_anomaly": False,
        "other_serious": False
    }
    
    if report.get("seriousnessdeath") == "1":
        seriousness["death"] = True
    
    if report.get("seriousnesslifethreatening") == "1":
        seriousness["life_threatening"] = True
    
    if report.get("seriousnesshospitalization") == "1":
        seriousness["hospitalization"] = True
    
    if report.get("seriousnessdisabling") == "1":
        seriousness["disability"] = True
    
    if report.get("seriousnesscongenitalanomali") == "1":
        seriousness["congenital_anomaly"] = True
    
    if report.get("seriousnessother") == "1":
        seriousness["other_serious"] = True
    
    return seriousness

if __name__ == "__main__":
    # For testing
    import sys
    
    if len(sys.argv) > 1:
        ndc_code = sys.argv[1]
        print(f"Fetching FAERS data for NDC code: {ndc_code}")
        data = get_faers_data(ndc_code)
        print(json.dumps(data, indent=2))
    else:
        print("Please provide an NDC code as an argument")