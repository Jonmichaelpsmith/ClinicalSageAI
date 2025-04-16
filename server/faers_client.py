#!/usr/bin/env python
"""
FAERS Client for LumenTrialGuide.AI

This module provides functions to query the FDA Adverse Event Reporting System (FAERS)
for drug safety data based on National Drug Codes (NDC) or drug names.
"""
import requests
import json
import os
import time
from urllib.parse import quote
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("faers_client.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("faers_client")

# Base URL for the FDA's openFDA API
FDA_API_BASE_URL = "https://api.fda.gov/drug/event.json"

# Rate limit management
REQUEST_DELAY = 1.0  # seconds between requests

def sanitize_ndc(ndc_code):
    """
    Sanitize and validate NDC code format.
    
    Args:
        ndc_code (str): National Drug Code (NDC) in various formats
        
    Returns:
        str: Sanitized NDC code
    """
    # Remove any non-alphanumeric characters
    sanitized = ''.join(c for c in ndc_code if c.isalnum())
    
    # Basic validation check
    if not sanitized or len(sanitized) < 8:
        logger.warning(f"NDC code '{ndc_code}' appears invalid after sanitization")
        
    return sanitized

def get_faers_data(ndc_code, limit=100):
    """
    Fetch adverse event data from FAERS based on NDC code.
    
    Args:
        ndc_code (str): National Drug Code
        limit (int): Maximum number of records to return
        
    Returns:
        dict: FAERS data in JSON format
    """
    sanitized_ndc = sanitize_ndc(ndc_code)
    logger.info(f"Fetching FAERS data for NDC: {sanitized_ndc}")
    
    # Build the OpenFDA API query
    # First try direct NDC matching
    query = f'openfda.product_ndc:"{sanitized_ndc}"'
    
    # Construct API URL with parameters
    api_url = f"{FDA_API_BASE_URL}?search={quote(query)}&limit={limit}"
    
    try:
        # Send API request
        response = requests.get(api_url)
        
        # Check response status
        if response.status_code == 200:
            data = response.json()
            
            # If no results found, try searching by NDC code as generic pattern
            if data.get('meta', {}).get('results', {}).get('total', 0) == 0:
                logger.info(f"No direct results found for NDC {sanitized_ndc}, trying generic search")
                
                # Use more generic search by removing leading zeros, etc.
                generic_query = f'openfda.product_ndc:*{sanitized_ndc}*'
                generic_api_url = f"{FDA_API_BASE_URL}?search={quote(generic_query)}&limit={limit}"
                
                # Wait before making another request (rate limiting)
                time.sleep(REQUEST_DELAY)
                
                response = requests.get(generic_api_url)
                if response.status_code == 200:
                    data = response.json()
                else:
                    logger.error(f"Generic search failed with status code: {response.status_code}, message: {response.text}")
                    # Provide empty results structure
                    data = {'results': [], 'meta': {'results': {'total': 0}}}
            
            logger.info(f"Retrieved {len(data.get('results', []))} FAERS records")
            return data
            
        else:
            logger.error(f"API request failed with status code: {response.status_code}, message: {response.text}")
            # Return empty results
            return {'results': [], 'meta': {'results': {'total': 0}}}
            
    except Exception as e:
        logger.exception(f"Error fetching FAERS data: {str(e)}")
        # Return empty results on error
        return {'results': [], 'meta': {'results': {'total': 0}}}

def search_faers_by_drug_name(drug_name, limit=100):
    """
    Search FAERS by drug name rather than NDC code.
    Useful when NDC code is not available or not yielding results.
    
    Args:
        drug_name (str): Name of the drug (brand name or generic)
        limit (int): Maximum number of records to return
        
    Returns:
        dict: FAERS data in JSON format
    """
    logger.info(f"Searching FAERS by drug name: {drug_name}")
    
    # Build queries for brand name and generic name
    brand_query = f'openfda.brand_name:"{drug_name}"'
    generic_query = f'openfda.generic_name:"{drug_name}"'
    combined_query = f'({brand_query}+OR+{generic_query})'
    
    # Construct API URL with parameters
    api_url = f"{FDA_API_BASE_URL}?search={quote(combined_query)}&limit={limit}"
    
    try:
        # Send API request
        response = requests.get(api_url)
        
        # Check response status
        if response.status_code == 200:
            data = response.json()
            logger.info(f"Retrieved {len(data.get('results', []))} FAERS records for drug name {drug_name}")
            return data
        else:
            logger.error(f"API request failed with status code: {response.status_code}, message: {response.text}")
            # Return empty results
            return {'results': [], 'meta': {'results': {'total': 0}}}
            
    except Exception as e:
        logger.exception(f"Error searching FAERS by drug name: {str(e)}")
        # Return empty results on error
        return {'results': [], 'meta': {'results': {'total': 0}}}

def get_drug_details(ndc_code):
    """
    Get detailed information about a drug from the openFDA API.
    
    Args:
        ndc_code (str): National Drug Code
        
    Returns:
        dict: Drug details from the FDA
    """
    sanitized_ndc = sanitize_ndc(ndc_code)
    logger.info(f"Fetching drug details for NDC: {sanitized_ndc}")
    
    # Use the drug label endpoint instead of the event endpoint
    fda_label_url = f"https://api.fda.gov/drug/label.json?search=openfda.product_ndc:{sanitized_ndc}"
    
    try:
        response = requests.get(fda_label_url)
        
        if response.status_code == 200:
            data = response.json()
            return data
        else:
            logger.error(f"API request for drug details failed: {response.status_code}, message: {response.text}")
            return {}
            
    except Exception as e:
        logger.exception(f"Error fetching drug details: {str(e)}")
        return {}

def main():
    """
    Command line interface for testing.
    """
    import argparse
    
    parser = argparse.ArgumentParser(description="Query FAERS for drug safety data")
    parser.add_argument("--ndc", help="National Drug Code (NDC) to search")
    parser.add_argument("--name", help="Drug name to search")
    parser.add_argument("--out", help="Output file for results (JSON)")
    parser.add_argument("--limit", type=int, default=100, help="Maximum results to return")
    
    args = parser.parse_args()
    
    if args.ndc:
        result = get_faers_data(args.ndc, limit=args.limit)
    elif args.name:
        result = search_faers_by_drug_name(args.name, limit=args.limit)
    else:
        parser.print_help()
        return
        
    # Print number of results
    if 'results' in result:
        print(f"Found {len(result['results'])} results")
    
    # Save to file if requested
    if args.out:
        with open(args.out, 'w') as f:
            json.dump(result, f, indent=2)
        print(f"Results saved to {args.out}")
    else:
        # Print first result as sample
        if 'results' in result and result['results']:
            print("\nSample result:")
            first_result = result['results'][0]
            
            # Extract key information for display
            if 'patient' in first_result:
                patient = first_result['patient']
                
                # Print reactions
                if 'reaction' in patient:
                    print("\nReactions:")
                    for reaction in patient['reaction'][:5]:  # Show first 5
                        print(f"  - {reaction.get('reactionmeddrapt', 'Unknown')}")
                
                # Print drug info
                if 'drug' in patient:
                    print("\nDrugs:")
                    for drug in patient['drug'][:3]:  # Show first 3
                        print(f"  - {drug.get('medicinalproduct', 'Unknown')}")

if __name__ == "__main__":
    main()