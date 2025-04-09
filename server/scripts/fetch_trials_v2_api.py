#!/usr/bin/env python3
"""
ClinicalTrials.gov API Data Fetcher - V2 API

This script fetches clinical trial data using the ClinicalTrials.gov API v2
and saves it to a JSON file for further processing.
"""

import argparse
import json
import os
import time
from datetime import datetime
import requests

def fetch_clinical_trials(
    query: str = "cancer", 
    max_records: int = 100,
    phase: str = None,
    output_dir: str = "./data"
) -> dict:
    """
    Fetch clinical trial data from ClinicalTrials.gov API v2
    
    Args:
        query: Medical condition to search for
        max_records: Maximum number of records to retrieve
        phase: Filter by specific trial phase
        output_dir: Directory to save the output
        
    Returns:
        Dictionary with fetching statistics
    """
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    base_url = "https://clinicaltrials.gov/api/v2/studies"
    
    # Initial parameters for API v2
    # Note: v2 API doesn't seem to accept condition/phase filters directly
    # We'll just retrieve studies and filter them afterwards
    params = {
        "format": "json",
        "pageSize": min(max_records, 100)  # API limits how many results per page
    }
    
    print(f"Making API request to {base_url} with params: {params}")
    
    # Initialize variables for pagination
    total_fetched = 0
    all_studies = []
    start_time = time.time()
    next_page_token = None
    
    try:
        while total_fetched < max_records:
            # Add the page token for pagination if we have one
            if next_page_token:
                params["pageToken"] = next_page_token
                
            # Add a delay to avoid rate limiting (after first request)
            if next_page_token:
                time.sleep(0.5)
                
            # Make the API request
            response = requests.get(base_url, params=params)
            
            # Check if request was successful
            if response.status_code == 200:
                try:
                    data = response.json()
                    
                    # Get the studies from the response
                    studies = data.get("studies", [])
                    next_page_token = data.get("nextPageToken", None)
                    
                    # If no studies are found or returned, break the loop
                    if not studies:
                        break
                        
                    # Add studies to our collection
                    all_studies.extend(studies)
                    total_fetched += len(studies)
                    
                    print(f"Fetched page, got {len(studies)} studies. Total: {total_fetched}/{max_records}")
                    
                    # If we've reached our limit or there's no next page, break
                    if total_fetched >= max_records or not next_page_token:
                        break
                    
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
    query_slug = query.replace(" ", "_").lower() if query else "all"
    phase_slug = f"_phase_{phase.replace(' ', '_').lower()}" if phase else ""
    
    output_file = os.path.join(output_dir, f"clinical_trials_{query_slug}{phase_slug}_{timestamp}.json")
    
    with open(output_file, 'w') as f:
        json.dump({
            "metadata": {
                "query": query,
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

def fetch_multiple_trials(queries, records_per_query, phase=None, output_dir="./data"):
    """
    Fetch clinical trial data for multiple queries
    
    Args:
        queries: List of medical conditions to search for
        records_per_query: Number of records to fetch per query
        phase: Filter by specific trial phase
        output_dir: Directory to save the output
        
    Returns:
        List of result dictionaries
    """
    results = []
    total_fetched = 0
    output_files = []
    
    for query in queries:
        print(f"\n{'='*50}")
        print(f"Fetching data for query: {query}")
        print(f"{'='*50}\n")
        
        result = fetch_clinical_trials(
            query=query,
            max_records=records_per_query,
            phase=phase,
            output_dir=output_dir
        )
        
        results.append(result)
        total_fetched += result["total_fetched"]
        output_files.append(result["output_file"])
    
    return {
        "success": any(r["success"] for r in results),
        "total_fetched": total_fetched,
        "output_files": output_files
    }

def main():
    """Command line interface for the script"""
    parser = argparse.ArgumentParser(description='Fetch clinical trial data from ClinicalTrials.gov')
    parser.add_argument('--query', type=str, default="cancer", help='Medical condition to search for (for single query mode)')
    parser.add_argument('--queries', type=str, help='Comma-separated list of medical conditions to search for (for multi-query mode)')
    parser.add_argument('--max-records', type=int, default=100, help='Maximum number of records to fetch (per query in multi-query mode)')
    parser.add_argument('--phase', type=str, help='Filter by trial phase (e.g. "Phase 1")')
    parser.add_argument('--output-dir', type=str, default="./data", help='Directory to save output files')
    parser.add_argument('--multi-query', action='store_true', help='Use multiple queries to fetch diverse data')
    
    args = parser.parse_args()
    
    # Create output directory
    os.makedirs(args.output_dir, exist_ok=True)
    
    # Default queries for multi-query mode
    default_queries = [
        "cancer", "diabetes", "cardiovascular", 
        "alzheimer", "covid", "asthma", 
        "arthritis", "hypertension", "depression",
        "obesity"
    ]
    
    if args.multi_query or args.queries:
        # Use provided queries or default to a predefined list
        queries = args.queries.split(",") if args.queries else default_queries
        
        # Calculate records per query to match total requested
        records_per_query = max(10, min(100, args.max_records // len(queries)))
        
        print(f"Fetching approximately {records_per_query} records for each of {len(queries)} queries")
        
        # Fetch data for multiple queries
        result = fetch_multiple_trials(
            queries=queries,
            records_per_query=records_per_query,
            phase=args.phase,
            output_dir=args.output_dir
        )
        
        if result["success"]:
            print(f"\nSUMMARY: Successfully fetched a total of {result['total_fetched']} records")
            for i, file_path in enumerate(result["output_files"]):
                print(f"  - File {i+1}: {file_path}")
        else:
            print("Failed to fetch clinical trial data")
            exit(1)
    else:
        # Single query mode (original behavior)
        result = fetch_clinical_trials(
            query=args.query,
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