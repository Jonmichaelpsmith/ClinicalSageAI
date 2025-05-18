#!/usr/bin/env python3
"""
Test different endpoints for the ClinicalTrials.gov API v1 beta
"""

import requests
import json

def test_endpoints():
    """Test various API endpoints to find the working one"""
    
    # List of potential endpoints to test
    endpoints = [
        "https://clinicaltrials.gov/api/v1/studies",
        "https://clinicaltrials.gov/api/v2/studies",
        "https://clinicaltrials.gov/api/query/study_fields",
        "https://clinicaltrials.gov/api/query/full_studies",
        "https://clinicaltrials.gov/api/query/study_structure",
        "https://clinicaltrials.gov/api/data-api/v1/studies",
        "https://clinicaltrials.gov/data-api/v1/studies",
        "https://classic.clinicaltrials.gov/api/query/study_fields",
        "https://www.clinicaltrials.gov/api/query/study_fields"
    ]
    
    # Basic query parameters
    params = {
        "expr": "cancer",
        "fields": "NCTId,BriefTitle,Condition,Phase",
        "min_rnk": 1,
        "max_rnk": 5,
        "fmt": "json"
    }
    
    # Test each endpoint
    for endpoint in endpoints:
        print(f"\nTesting endpoint: {endpoint}")
        try:
            response = requests.get(endpoint, params=params, timeout=10)
            print(f"Status code: {response.status_code}")
            
            if response.status_code == 200:
                print("Success! First 100 characters of response:")
                print(response.text[:100])
                
                try:
                    data = response.json()
                    if isinstance(data, dict):
                        print("\nJSON keys at top level:", list(data.keys()))
                        
                        # Try to find studies in the data
                        if "studies" in data:
                            print(f"Found {len(data['studies'])} studies")
                        elif "StudyFieldsResponse" in data:
                            study_fields = data.get("StudyFieldsResponse", {}).get("StudyFields", [])
                            print(f"Found {len(study_fields)} studies in StudyFieldsResponse.StudyFields")
                    else:
                        print("Response was valid JSON but not a dictionary")
                        
                except json.JSONDecodeError:
                    print("Response is not valid JSON")
            else:
                print(f"Error response: {response.text[:100]}...")
                
        except Exception as e:
            print(f"Error connecting to endpoint: {e}")
            
    print("\nEndpoint testing complete")

if __name__ == "__main__":
    test_endpoints()