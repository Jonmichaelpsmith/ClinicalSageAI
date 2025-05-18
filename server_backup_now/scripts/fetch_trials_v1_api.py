#!/usr/bin/env python3
"""
ClinicalTrials.gov API Data Fetcher - V1 API

This script fetches clinical trial data using the ClinicalTrials.gov Data API v1
and saves it to a JSON file for further processing.
"""

import os
import json
import time
import requests
import argparse
from datetime import datetime
from typing import List, Dict, Any, Optional

def fetch_clinical_trials(
    condition: str = "cancer", 
    max_records: int = 100,
    phase: Optional[str] = None,
    output_dir: str = "./data"
) -> Dict[str, Any]:
    """
    Fetch clinical trial data from ClinicalTrials.gov Data API v1
    
    Args:
        condition: Medical condition to search for
        max_records: Maximum number of records to retrieve
        phase: Filter by specific trial phase
        output_dir: Directory to save the output
        
    Returns:
        Dictionary with fetching statistics
    """
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    base_url = "https://clinicaltrials.gov/api/query/study_fields"
    
    # Build query parameters - updated for API v1 format
    params = {
        "expr": condition,
        "fields": "NCTId,BriefTitle,Condition,Phase,LeadSponsorName,StudyType,EnrollmentCount",
        "min_rnk": 1,
        "max_rnk": min(max_records, 100),  # API limits per request
        "fmt": "json"
    }
    
    if phase:
        # Format for v1 API is to append to the expr param
        params["expr"] = f"{params['expr']} AND PHASE={phase}"
        
    print(f"Making API request to {base_url} with params: {params}")
    
    # Initialize variables for pagination
    current_page = 1
    total_fetched = 0
    all_studies = []
    start_time = time.time()
    
    try:
        while total_fetched < max_records:
            params["page"] = current_page
            
            # Add a delay to avoid rate limiting
            if current_page > 1:
                time.sleep(0.5)
                
            # Make the API request
            response = requests.get(base_url, params=params)
            
            # Check if request was successful
            if response.status_code == 200:
                try:
                    data = response.json()
                    
                    # Get the studies from the response - updated for API v1 format
                    studies = data.get("StudyFieldsResponse", {}).get("StudyFields", [])
                    total_count = int(data.get("StudyFieldsResponse", {}).get("NStudiesFound", 0))
                    
                    # If no studies are found or returned, break the loop
                    if not studies:
                        break
                        
                    # Add studies to our collection
                    all_studies.extend(studies)
                    total_fetched += len(studies)
                    
                    print(f"Fetched page {current_page}, got {len(studies)} studies. Total: {total_fetched}/{min(total_count, max_records)}")
                    
                    # If we've fetched all available studies or reached our limit, break
                    if total_fetched >= min(total_count, max_records):
                        break
                        
                    # Move to the next page
                    current_page += 1
                    
                except json.JSONDecodeError as e:
                    print(f"Error decoding JSON response: {e}")
                    print(f"Response content: {response.text[:500]}...")
                    break
            else:
                print(f"Error: {response.status_code}, {response.text}")
                break
                
    except Exception as e:
        print(f"Error fetching data: {e}")
        
    # Calculate statistics
    end_time = time.time()
    elapsed_time = end_time - start_time
    
    # Save the data to a JSON file
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    condition_slug = condition.replace(" ", "_").lower()
    phase_slug = f"_phase_{phase.replace(' ', '_').lower()}" if phase else ""
    
    output_file = os.path.join(output_dir, f"clinical_trials_{condition_slug}{phase_slug}_{timestamp}.json")
    
    with open(output_file, 'w') as f:
        json.dump({
            "metadata": {
                "condition": condition,
                "phase": phase,
                "total_fetched": total_fetched,
                "fetch_date": datetime.now().isoformat(),
                "elapsed_seconds": elapsed_time
            },
            "studies": all_studies
        }, f, indent=2)
        
    print(f"Saved {total_fetched} studies to {output_file}")
    
    return {
        "success": total_fetched > 0,
        "total_fetched": total_fetched,
        "elapsed_seconds": elapsed_time,
        "output_file": output_file
    }

def main():
    """Command line interface for the script"""
    parser = argparse.ArgumentParser(description='Fetch clinical trial data from ClinicalTrials.gov')
    parser.add_argument('--condition', type=str, default="cancer", help='Medical condition to search for')
    parser.add_argument('--max-records', type=int, default=100, help='Maximum number of records to fetch')
    parser.add_argument('--phase', type=str, help='Filter by trial phase')
    parser.add_argument('--output-dir', type=str, default="./data", help='Directory to save output files')
    
    args = parser.parse_args()
    
    # Create output directory
    os.makedirs(args.output_dir, exist_ok=True)
    
    # Fetch the data
    result = fetch_clinical_trials(
        condition=args.condition,
        max_records=args.max_records,
        phase=args.phase,
        output_dir=args.output_dir
    )
    
    if result["success"]:
        print(f"Successfully fetched {result['total_fetched']} records in {result['elapsed_seconds']:.2f} seconds")
        print(f"Data saved to {result['output_file']}")
    else:
        print("Failed to fetch clinical trial data")
        exit(1)

if __name__ == "__main__":
    main()