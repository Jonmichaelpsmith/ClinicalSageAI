from typing import Dict, List, Optional

def get_project_list() -> List[Dict]:
    """
    Stub: Get list of projects from Benchling API
    Returns a list of dicts with project IDs and names
    """
    # TODO: replace stub with real Benchling API calls
    return [
        {"id": "proj1", "name": "Project 1"},
        {"id": "proj2", "name": "Project 2"},
        {"id": "demo", "name": "Demo Project"},
    ]

def fetch_benchling_cmc(project_id: str) -> Optional[Dict]:
    """
    Stub: Fetch CMC data for a given project_id from Benchling.
    Returns a dict with keys matching Module 3 fields.
    """
    # TODO: replace stub with real Benchling API calls
    if project_id == "demo":
        return {
            "drug_name": "TestDrug",
            "manufacturing_site": "Site A",
            "batch_number": "BATCH123",
            "specifications": [
                {"parameter": "Assay (%)", "limit": "95–105", "result": "98.2"},
                {"parameter": "Purity (%)", "limit": "> 99.0", "result": "99.5"},
            ],
            "stability_data": [
                {"timepoint": "0 months", "result": "98.2"},
                {"timepoint": "3 months", "result": "97.8"},
            ],
        }
    return None