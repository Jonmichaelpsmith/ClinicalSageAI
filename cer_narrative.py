#!/usr/bin/env python3
"""
CER Narrative Generator

This module generates structured Clinical Evaluation Report (CER) narratives
using OpenAI's API based on FAERS data.
"""

import os
import sys
import json
import time
from datetime import datetime
from typing import Dict, Any, Optional

import openai

# Import logging utilities
from logging_utils import logger, timed_function, generate_request_id

def check_api_key():
    """Verify that the OpenAI API key is available"""
    if not os.environ.get('OPENAI_API_KEY'):
        sys.stderr.write("Error: OPENAI_API_KEY environment variable is not set\n")
        return False
    return True

@timed_function
def generate_cer_narrative(faers_data: Dict[str, Any], product_name: str = None) -> str:
    """
    Generate a structured CER narrative from FAERS data.

    Args:
        faers_data: Processed data from the FDA FAERS database
        product_name: Optional product name to use in the report

    Returns:
        Structured CER narrative text
    """
    # Generate request ID for tracking this process
    process_id = generate_request_id()
    
    # Extract NDC code for logging
    ndc_code = faers_data.get("drug_info", {}).get("ndc_code", "unknown")
    logger.info(f"CER Narrative [{process_id}] - Starting generation for NDC: {ndc_code}")
    
    # Verify API key is available
    if not check_api_key():
        logger.error(f"CER Narrative [{process_id}] - OpenAI API key not configured")
        raise Exception("OpenAI API key not configured")
    
    # Prepare data for the narrative
    drug_info = faers_data.get("drug_info", {})
    results = faers_data.get("results", [])
    meta = faers_data.get("meta", {})
    
    # Use provided product name or extract from data
    product_display_name = product_name or drug_info.get("brand_name") or drug_info.get("generic_name") or f"NDC {drug_info.get('ndc_code')}"
    
    # Count serious vs. non-serious cases
    serious_count = sum(1 for r in results if r.get("serious"))
    non_serious_count = len(results) - serious_count
    
    # Process reactions to get frequency
    all_reactions = []
    for report in results:
        all_reactions.extend(report.get("reactions", []))
    
    reaction_counts = {}
    for reaction in all_reactions:
        reaction_counts[reaction] = reaction_counts.get(reaction, 0) + 1
    
    # Sort reactions by frequency
    sorted_reactions = sorted(
        [(k, v) for k, v in reaction_counts.items()],
        key=lambda x: x[1],
        reverse=True
    )
    
    # Format top reactions
    top_reactions = []
    for reaction, count in sorted_reactions[:10]:  # Top 10 reactions
        percentage = (count / len(results)) * 100
        top_reactions.append(f"{reaction}: {count} cases ({percentage:.1f}%)")
    
    # Prepare summary statistics for demographics
    ages = [r.get("patient", {}).get("age") for r in results if r.get("patient", {}).get("age") is not None]
    genders = [r.get("patient", {}).get("gender") for r in results if r.get("patient", {}).get("gender") != "Unknown"]
    weights = [r.get("patient", {}).get("weight") for r in results if r.get("patient", {}).get("weight") is not None]
    
    avg_age = sum(ages) / len(ages) if ages else None
    gender_dist = {}
    for gender in genders:
        gender_dist[gender] = gender_dist.get(gender, 0) + 1
    
    min_weight = min(weights) if weights else None
    max_weight = max(weights) if weights else None
    
    # Prepare report date range
    report_dates = [r.get("report_date") for r in results if r.get("report_date")]
    date_range = {}
    if report_dates:
        date_range = {
            "first_report": min(report_dates),
            "last_report": max(report_dates)
        }
    
    # Prepare outcomes summary
    outcomes = {}
    for report in results:
        outcome = report.get("outcome")
        if outcome:
            outcomes[outcome] = outcomes.get(outcome, 0) + 1
    
    # Create prompt for the OpenAI API
    prompt = f"""
Generate a detailed Clinical Evaluation Report (CER) for {product_display_name} based on the following FDA Adverse Event Reporting System (FAERS) data:

- Total Reports Analyzed: {len(results)}
- Serious Cases: {serious_count} ({(serious_count/len(results)*100):.1f}% of total)
- Non-Serious Cases: {non_serious_count} ({(non_serious_count/len(results)*100):.1f}% of total)
- Report Date Range: {date_range.get('first_report', 'Unknown')} to {date_range.get('last_report', 'Unknown')}
- Manufacturer: {drug_info.get('manufacturer', 'Unknown')}

Top Reported Adverse Events:
{chr(10).join(top_reactions)}

Demographics Summary:
- Average Age: {f"{avg_age:.1f} years" if avg_age else "Unknown"}
- Gender Distribution: {", ".join([f"{gender}: {count} ({count/len(genders)*100:.1f}%)" for gender, count in gender_dist.items()]) if genders else "Unknown"}
- Weight Range: {f"{min_weight:.1f} to {max_weight:.1f} kg" if min_weight and max_weight else "Unknown"}

Outcome Summary:
{chr(10).join([f"- {outcome}: {count} cases ({count/len(results)*100:.1f}%)" for outcome, count in outcomes.items()])}

Please format the CER following MEDDEV 2.7/1 Rev. 4 guidance with these sections:
1. Executive Summary
2. Introduction (including device description and intended use)
3. Clinical Safety Analysis (including adverse events evaluation)
4. Risk Management Evaluation
5. Post-Market Surveillance Conclusions
6. Recommendations

Include specific statistics from the data provided, use medical terminology appropriate for regulatory documentation, and make evidence-based conclusions.
"""

    # Generate the narrative using OpenAI's API
    client = openai.OpenAI()
    
    # Start timing the OpenAI API call
    api_call_start = time.time()
    logger.info(f"CER Narrative [{process_id}] - Calling OpenAI API for NDC: {ndc_code}")
    
    try:
        response = client.chat.completions.create(
            model="gpt-4-turbo-preview",  # Using the latest available model
            messages=[
                {"role": "system", "content": "You are a regulatory affairs specialist creating a Clinical Evaluation Report (CER)."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,  # Lower temperature for more consistent output
            max_tokens=2000,  # Generate a detailed report
        )
        
        api_call_duration = (time.time() - api_call_start) * 1000
        logger.info(f"CER Narrative [{process_id}] - OpenAI API responded in {api_call_duration:.2f}ms")
        
        narrative = response.choices[0].message.content
    except Exception as e:
        api_call_duration = (time.time() - api_call_start) * 1000
        logger.error(f"CER Narrative [{process_id}] - OpenAI API error after {api_call_duration:.2f}ms: {str(e)}")
        raise
    
    # Add metadata header
    header = f"""# Clinical Evaluation Report
## {product_display_name}
### Generated: {datetime.now().strftime('%Y-%m-%d')}
### Data Source: FDA FAERS
### Report Count: {len(results)} ({serious_count} serious, {non_serious_count} non-serious)

"""
    
    return header + narrative

@timed_function
def main():
    """Main entry point for the script"""
    process_id = generate_request_id()
    logger.info(f"CER Narrative CLI [{process_id}] - Starting process")
    
    # Check if we have an input file from stdin
    if not sys.stdin.isatty():
        try:
            # Read input JSON from stdin
            input_data = json.load(sys.stdin)
            faers_data = input_data.get('faersData')
            product_name = input_data.get('productName')
            
            # Extract NDC code for logging if available
            ndc_code = faers_data.get("drug_info", {}).get("ndc_code", "unknown") if faers_data else "unknown"
            logger.info(f"CER Narrative CLI [{process_id}] - Processing request for NDC: {ndc_code}")
            
            if not faers_data:
                logger.error(f"CER Narrative CLI [{process_id}] - FAERS data is required but not provided")
                print(json.dumps({"error": "FAERS data is required"}))
                sys.exit(1)
                
            narrative = generate_cer_narrative(faers_data, product_name)
            narrative_length = len(narrative)
            logger.info(f"CER Narrative CLI [{process_id}] - Successfully generated narrative of {narrative_length} characters")
            print(json.dumps({"narrative": narrative}))
        except Exception as e:
            logger.error(f"CER Narrative CLI [{process_id}] - Error processing input: {str(e)}")
            print(json.dumps({"error": f"Error processing input: {str(e)}"}))
            sys.exit(1)
    else:
        logger.error(f"CER Narrative CLI [{process_id}] - No input data provided")
        print(json.dumps({"error": "No input data provided"}))
        sys.exit(1)

if __name__ == "__main__":
    main()