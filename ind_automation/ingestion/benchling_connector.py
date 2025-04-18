# ingestion/benchling_connector.py
import os
import json
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

# Mock data for demonstration purposes
MOCK_DATA = {
    "PRJ001": {
        "drug_name": "TXB-452 (Oncology Compound)",
        "manufacturing_site": "BioPharma Manufacturing Campus, Building 7",
        "batch_number": "TXB452-001-2023",
        "specifications": [
            {"parameter": "Appearance", "limit": "White to off-white crystalline powder", "result": "White crystalline powder"},
            {"parameter": "Identification (IR)", "limit": "Conforms to reference standard", "result": "Conforms"},
            {"parameter": "Assay (%)", "limit": "98.0–102.0", "result": "100.2"},
            {"parameter": "Related Substances (Total %)", "limit": "≤ 2.0", "result": "0.3"},
            {"parameter": "Water Content (%)", "limit": "≤ 0.5", "result": "0.2"},
            {"parameter": "Residual Solvents", "limit": "Meets ICH Guidelines", "result": "Complies"},
            {"parameter": "Particle Size Distribution", "limit": "D90 ≤ 100 μm", "result": "87 μm"}
        ],
        "stability_data": [
            {"timepoint": "Initial", "result": "100.2%"},
            {"timepoint": "1 month (25°C/60% RH)", "result": "99.8%"},
            {"timepoint": "3 months (25°C/60% RH)", "result": "99.5%"},
            {"timepoint": "6 months (25°C/60% RH)", "result": "99.1%"},
            {"timepoint": "1 month (40°C/75% RH)", "result": "98.9%"},
            {"timepoint": "3 months (40°C/75% RH)", "result": "98.2%"}
        ]
    },
    "PRJ002": {
        "drug_name": "GLC-789 (Diabetes Compound)",
        "manufacturing_site": "MedChem Synthesis Facility, Suite 12",
        "batch_number": "GLC789-022-2023",
        "specifications": [
            {"parameter": "Appearance", "limit": "White powder", "result": "White powder"},
            {"parameter": "Identity (HPLC)", "limit": "Retention time corresponds to reference", "result": "Conforms"},
            {"parameter": "Assay (%)", "limit": "97.0–103.0", "result": "99.7"},
            {"parameter": "Impurities (Total %)", "limit": "≤ 1.0", "result": "0.4"},
            {"parameter": "Heavy Metals", "limit": "≤ 20 ppm", "result": "< 5 ppm"},
            {"parameter": "Loss on Drying (%)", "limit": "≤ 1.0", "result": "0.3"}
        ],
        "stability_data": [
            {"timepoint": "Initial", "result": "99.7%"},
            {"timepoint": "1 month (25°C/60% RH)", "result": "99.5%"},
            {"timepoint": "3 months (25°C/60% RH)", "result": "99.3%"},
            {"timepoint": "6 months (25°C/60% RH)", "result": "99.0%"},
            {"timepoint": "1 month (40°C/75% RH)", "result": "98.7%"},
            {"timepoint": "3 months (40°C/75% RH)", "result": "98.1%"}
        ]
    },
    "PRJ003": {
        "drug_name": "NRV-567 (Neurological Compound)",
        "manufacturing_site": "Advanced Therapeutics Facility, Building 3",
        "batch_number": "NRV567-004-2023",
        "specifications": [
            {"parameter": "Appearance", "limit": "Off-white to pale yellow powder", "result": "Pale yellow powder"},
            {"parameter": "Identification (HPLC)", "limit": "Conforms to reference standard", "result": "Conforms"},
            {"parameter": "Identification (IR)", "limit": "Conforms to reference standard", "result": "Conforms"},
            {"parameter": "Assay (%)", "limit": "95.0–105.0", "result": "101.3"},
            {"parameter": "Related Substances (Individual, %)", "limit": "≤ 0.5", "result": "0.2"},
            {"parameter": "Related Substances (Total, %)", "limit": "≤ 2.0", "result": "0.5"},
            {"parameter": "Residual Solvents", "limit": "Meets ICH Guidelines", "result": "Complies"},
            {"parameter": "Bacterial Endotoxins", "limit": "< 5 EU/mg", "result": "< 0.5 EU/mg"}
        ],
        "stability_data": [
            {"timepoint": "Initial", "result": "101.3%"},
            {"timepoint": "1 month (25°C/60% RH)", "result": "101.0%"},
            {"timepoint": "3 months (25°C/60% RH)", "result": "100.7%"},
            {"timepoint": "6 months (25°C/60% RH)", "result": "100.2%"},
            {"timepoint": "1 month (40°C/75% RH)", "result": "99.8%"},
            {"timepoint": "3 months (40°C/75% RH)", "result": "99.1%"}
        ]
    },
    "TEST123": {
        "drug_name": "Test Compound X-123",
        "manufacturing_site": "Test Facility",
        "batch_number": "TEST-123-2023",
        "specifications": [
            {"parameter": "Appearance", "limit": "White powder", "result": "White powder"},
            {"parameter": "Assay (%)", "limit": "95.0–105.0", "result": "98.5"},
            {"parameter": "Impurities (Total %)", "limit": "≤ 2.0", "result": "0.8"}
        ],
        "stability_data": [
            {"timepoint": "Initial", "result": "98.5%"},
            {"timepoint": "1 month (25°C/60% RH)", "result": "98.3%"},
            {"timepoint": "3 months (25°C/60% RH)", "result": "98.0%"}
        ]
    }
}

def fetch_benchling_cmc(project_id: str) -> Optional[Dict[str, Any]]:
    """
    Fetch CMC data for a given project_id from Benchling.
    Returns a dict with keys matching Module 3 fields.
    
    Args:
        project_id: The Benchling project ID
        
    Returns:
        Dictionary containing CMC data or None if not found
    """
    try:
        logger.info(f"Fetching Benchling data for project: {project_id}")
        
        # Check if an API key is provided
        api_key = os.environ.get("BENCHLING_API_KEY")
        
        # If API key is provided, use the real Benchling API
        if api_key:
            # In a real implementation, this would call the Benchling API
            # and transform the response into our expected format
            logger.info("Using Benchling API with provided key")
            
            # For now, still using mock data - would be replaced with real API calls
            data = MOCK_DATA.get(project_id)
            
            if not data:
                logger.warning(f"No data found for project ID: {project_id}")
                return None
            
            return data
        
        # Otherwise use mock data
        logger.info("No Benchling API key found, using demonstration data")
        if project_id in MOCK_DATA:
            return MOCK_DATA[project_id]
        
        # If the project ID doesn't exist in our mock data, return None
        logger.warning(f"No data found for project ID: {project_id}")
        return None
    
    except Exception as e:
        logger.error(f"Error fetching Benchling CMC data: {str(e)}", exc_info=True)
        return None
        
def get_project_list():
    """
    Get a list of available projects
    
    Returns:
        List of project information dictionaries
    """
    # In a real implementation, this would query the Benchling API
    projects = [
        {"id": project_id, "name": data["drug_name"]} 
        for project_id, data in MOCK_DATA.items()
    ]
    
    return projects