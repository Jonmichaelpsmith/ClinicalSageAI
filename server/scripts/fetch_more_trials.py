#!/usr/bin/env python3

"""
Enhanced Clinical Trials Fetcher
This script fetches a large number of trials from ClinicalTrials.gov API v2
and processes them into a format ready for database import.
"""

import os
import requests
import json
import time
from datetime import datetime

def fetch_trials_batch(page_token=None, count=100):
    """Fetch a batch of trials from ClinicalTrials.gov API"""
    base_url = "https://clinicaltrials.gov/api/v2/studies"
    
    params = {
        "format": "json",
        "countTotal": "true",
        "pageSize": count
    }
    
    if page_token:
        params["nextPageToken"] = page_token
    
    print(f"Fetching batch of {count} trials...")
    response = requests.get(base_url, params=params)
    
    if response.status_code != 200:
        print(f"Error: {response.status_code}")
        print(response.text)
        return None, 0
    
    data = response.json()
    total_count = data.get('totalCount', 0)
    studies = data.get('studies', [])
    
    print(f"Fetched {len(studies)} trials. Total available: {total_count}")
    return studies, total_count

def process_trial(study):
    """Process a single trial into our format"""
    protocol = study.get('protocolSection', {})
    
    # Extract basic information
    identification = protocol.get('identificationModule', {})
    status = protocol.get('statusModule', {})
    sponsor = protocol.get('sponsorCollaboratorsModule', {})
    conditions = protocol.get('conditionsModule', {})
    design = protocol.get('designModule', {})
    eligibility = protocol.get('eligibilityModule', {})
    description = protocol.get('descriptionModule', {})
    
    # Extract dates
    start_date = status.get('startDate', '')
    completion_date = status.get('completionDate', '')
    primary_completion_date = status.get('primaryCompletionDate', '')
    
    # Format study properly
    processed_study = {
        "nctrialId": identification.get('nctId', ''),
        "title": identification.get('briefTitle', ''),
        "officialTitle": identification.get('officialTitle', ''),
        "sponsor": sponsor.get('leadSponsor', {}).get('name', 'Unknown'),
        "indication": ', '.join(conditions.get('conditions', [])),
        "phase": design.get('phases', ['Unknown'])[0] if design.get('phases') else 'Unknown',
        "fileName": f"{identification.get('nctId', 'unknown')}.xml",
        "fileSize": 0,  # Placeholder
        "date": start_date,
        "completionDate": completion_date or primary_completion_date,
        "drugName": ', '.join([i.get('name', '') for i in design.get('interventions', []) if i and i.get('name')]) or 'Unknown',
        "source": "ClinicalTrials.gov API v2",
        "studyType": design.get('studyType', ''),
        "description": description.get('briefSummary', ''),
        "detailedDescription": description.get('detailedDescription', ''),
        "eligibilityCriteria": eligibility.get('eligibilityCriteria', '')
    }
    
    return processed_study

def main():
    """Main function to fetch and process clinical trials"""
    total_trials_needed = 500
    trials_per_batch = 100
    all_studies = []
    
    # First batch without page token
    next_page_token = None
    
    while len(all_studies) < total_trials_needed:
        # Fetch batch of studies
        data = requests.get(
            "https://clinicaltrials.gov/api/v2/studies",
            params={
                "format": "json",
                "pageSize": trials_per_batch,
                **({"nextPageToken": next_page_token} if next_page_token else {})
            }
        ).json()
        
        studies = data.get("studies", [])
        next_page_token = data.get("nextPageToken")
        
        if not studies:
            print("No more studies available")
            break
            
        # Process each study
        processed_studies = [process_trial(study) for study in studies]
        all_studies.extend(processed_studies)
        
        print(f"Processed {len(processed_studies)} studies. Total processed so far: {len(all_studies)}")
        
        # Check if we have a next page token
        if not next_page_token:
            print("No more pages available")
            break
            
        # Sleep to avoid hitting rate limits
        time.sleep(1)
    
    # Save to JSON file
    output = {
        "processed_count": len(all_studies),
        "processed_date": datetime.now().isoformat(),
        "studies": all_studies
    }
    
    with open('additional_trials.json', 'w') as f:
        json.dump(output, f, indent=2)
    
    print(f"Successfully processed and saved {len(all_studies)} studies to additional_trials.json")

if __name__ == "__main__":
    main()