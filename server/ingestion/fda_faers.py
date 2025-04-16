# ingestion/fda_faers.py
import requests

FAERS_API_URL = "https://api.fda.gov/drug/event.json"

def fetch_faers_data(ndc_code: str, limit: int = 100):
    """
    Query FAERS (via OpenFDA) for adverse events filtered by NDC code.
    Returns the raw JSON response.
    """
    query = f'openfda.product_ndc:"{ndc_code}"'
    response = requests.get(f"{FAERS_API_URL}?search={query}&limit={limit}", timeout=10)
    response.raise_for_status()
    return response.json()