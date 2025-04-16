# ingestion/eu_eudamed.py
import requests

EUDAMED_SEARCH_URL = "https://ec.europa.eu/tools/eudamed/eudamed"

def fetch_eudamed_data(device_code: str):
    """
    Placeholder: attempts to fetch data from EU Eudamed.
    Currently returns an informational message.
    """
    # If an API is provided in the future, implement here.
    return {
        "message": "EU Eudamed API not yet available programmatically",
        "device_code": device_code
    }