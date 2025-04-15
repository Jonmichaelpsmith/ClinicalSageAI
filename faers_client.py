import requests

FAERS_API_URL = "https://api.fda.gov/drug/event.json"

def get_faers_data(ndc_code, limit=100):
    """
    Fetch adverse event data from FDA FAERS API for a given NDC code
    
    Args:
        ndc_code (str): National Drug Code identifier
        limit (int): Maximum number of records to retrieve
        
    Returns:
        dict: JSON response from FAERS API with adverse event data
    """
    try:
        response = requests.get(f"{FAERS_API_URL}?search=openfda.product_ndc:\"{ndc_code}\"&limit={limit}")
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching FAERS data: {e}")
        return {"error": str(e), "results": []}