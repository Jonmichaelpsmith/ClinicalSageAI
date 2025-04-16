"""
FAERS Client for LumenTrialGuide.AI

This module handles fetching data from the FDA's FAERS (FDA Adverse Event Reporting System) API
to retrieve adverse event reports for specified product NDC codes.
"""
import requests

FAERS_API_URL = "https://api.fda.gov/drug/event.json"

def get_faers_data(ndc_code, limit=100):
    """
    Fetches adverse event data from FDA FAERS API for a given NDC code.
    
    Args:
        ndc_code (str): The National Drug Code (NDC) for the product
        limit (int, optional): Maximum number of results to return. Defaults to 100.
        
    Returns:
        dict: JSON response from FAERS API
    """
    response = requests.get(
        f"{FAERS_API_URL}?search=openfda.product_ndc:\"{ndc_code}\"&limit={limit}"
    )
    response.raise_for_status()  # Raise an exception for HTTP errors
    return response.json()