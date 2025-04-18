# ingestion/benchling_connector.py
from typing import Dict

def fetch_benchling_cmc(project_id: str) -> Dict:
    """
    Stub: Fetch CMC data for a given project_id from Benchling.
    Returns a dict with keys matching Module 3 fields.
    """
    # TODO: replace stub with real Benchling API calls
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