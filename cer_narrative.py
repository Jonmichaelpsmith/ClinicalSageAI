"""
CER Narrative Generator

This module generates structured Clinical Evaluation Report (CER) narratives
using OpenAI's API based on FAERS data.
"""

import os
import openai
from typing import Dict, Any

# Set API key from environment variable
def check_api_key():
    """Verify that the OpenAI API key is available"""
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY environment variable is not set")
    return api_key

def generate_cer_narrative(faers_data: Dict[str, Any], product_name: str = None) -> str:
    """
    Generate a structured CER narrative from FAERS data.

    Args:
        faers_data: Processed data from the FDA FAERS database
        product_name: Optional product name to use in the report

    Returns:
        Structured CER narrative text
    """
    api_key = check_api_key()
    openai.api_key = api_key
    
    # Extract key information for the prompt
    drug_info = faers_data.get("drug_info", {})
    meta = faers_data.get("meta", {})
    results = faers_data.get("results", [])
    
    # Use provided product name or extract from data
    product = product_name or drug_info.get("brand_name") or drug_info.get("generic_name") or f"NDC {faers_data.get('ndc_code')}"
    
    # Calculate basic statistics
    report_count = len(results)
    serious_cases = sum(1 for r in results if any(r.get("seriousness", {}).values()))
    death_cases = sum(1 for r in results if r.get("seriousness", {}).get("death", False))
    
    # Collect all reaction terms
    all_reactions = []
    for report in results:
        for reaction in report.get("reactions", []):
            all_reactions.append(reaction.get("term"))
    
    # Count frequencies
    from collections import Counter
    reaction_counts = Counter(all_reactions)
    top_reactions = reaction_counts.most_common(10)
    
    # Demographic analysis
    ages = [r.get("patient", {}).get("age") for r in results if r.get("patient", {}).get("age")]
    avg_age = sum(ages) / len(ages) if ages else "Unknown"
    
    males = sum(1 for r in results if r.get("patient", {}).get("sex") == "Male")
    females = sum(1 for r in results if r.get("patient", {}).get("sex") == "Female")
    
    # Construct the prompt
    prompt = f"""
    Generate a detailed Clinical Evaluation Report (CER) narrative following the MEDDEV 2.7/1 Rev 4 structure for the following product based on FDA FAERS data:

    PRODUCT: {product}
    MANUFACTURER: {drug_info.get("manufacturer", "Unknown")}
    TOTAL REPORTS: {report_count}
    SERIOUS CASES: {serious_cases}
    DEATHS: {death_cases}
    AVERAGE AGE: {avg_age}
    GENDER DISTRIBUTION: {males} males, {females} females
    
    TOP ADVERSE EVENTS:
    {", ".join(f"{term} ({count})" for term, count in top_reactions)}
    
    Please structure the CER narrative with the following sections:
    1. Executive Summary
    2. Introduction and Device Description
    3. Scope of the Clinical Evaluation
    4. Safety Analysis
       4.1 Overall Adverse Events Profile
       4.2 Serious Adverse Events
       4.3 Demographics Analysis
    5. Risk-Benefit Analysis
    6. Conclusions
    7. Recommendations

    The report should be well-structured, formal in tone, and focus on objective analysis of the data.
    """
    
    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a regulatory medical writer specialized in creating Clinical Evaluation Reports."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=2000
        )
        
        # Extract the generated narrative
        narrative = response.choices[0].message['content'].strip()
        return narrative
        
    except Exception as e:
        raise Exception(f"Error generating CER narrative: {str(e)}")

if __name__ == "__main__":
    # For testing
    import sys
    import json
    
    if len(sys.argv) > 1:
        with open(sys.argv[1], 'r') as f:
            data = json.load(f)
        
        narrative = generate_cer_narrative(data)
        print(narrative)
    else:
        print("Please provide a JSON file with FAERS data as an argument")