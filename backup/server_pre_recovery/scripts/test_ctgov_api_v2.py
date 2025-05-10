#!/usr/bin/env python3
"""
Test ClinicalTrials.gov API v2 endpoints
"""

import requests
import json

def test_v2_endpoint():
    """Test various API endpoints for v2"""
    
    # API v2 endpoint
    endpoint = "https://clinicaltrials.gov/api/v2/studies"
    
    # Parameters for API v2 - trying different parameter formats
    params = {
        "pageSize": 5,
        "format": "json"
    }
    
    print(f"Testing endpoint: {endpoint}")
    print(f"Parameters: {params}")
    
    try:
        response = requests.get(endpoint, params=params, timeout=10)
        print(f"Status code: {response.status_code}")
        
        if response.status_code == 200:
            print("Success! Response received.")
            
            try:
                data = response.json()
                print(f"JSON keys at top level: {list(data.keys())}")
                
                # Check if studies are in the response
                studies = data.get("studies", [])
                if studies:
                    print(f"Found {len(studies)} studies!")
                    print("\nFirst study information:")
                    first_study = studies[0]
                    study_id = first_study.get("protocolSection", {}).get("identificationModule", {}).get("nctId")
                    title = first_study.get("protocolSection", {}).get("identificationModule", {}).get("briefTitle")
                    print(f"NCT ID: {study_id}")
                    print(f"Title: {title}")
                else:
                    print("No studies found in the response.")
                
            except json.JSONDecodeError:
                print("Response is not valid JSON")
                print(f"Raw response (first 500 chars): {response.text[:500]}")
        else:
            print(f"Error response: {response.text}")
            
    except Exception as e:
        print(f"Error connecting to endpoint: {e}")

if __name__ == "__main__":
    test_v2_endpoint()