#!/usr/bin/env python
"""
CER Narrative Generator

This module generates clinical evaluation report (CER) narratives
based on FAERS (FDA Adverse Event Reporting System) data.
"""
import json
import argparse
import sys
import re
from datetime import datetime
try:
    import openai
except ImportError:
    # Handle case where OpenAI isn't installed, will use simpler approach
    openai = None

def get_product_details(faers_data):
    """Extract product details from FAERS data response"""
    product_name = None
    manufacturer = None
    
    if "results" in faers_data and len(faers_data["results"]) > 0:
        result = faers_data["results"][0]
        if "openfda" in result:
            openfda = result["openfda"]
            if "brand_name" in openfda and len(openfda["brand_name"]) > 0:
                product_name = openfda["brand_name"][0]
            elif "generic_name" in openfda and len(openfda["generic_name"]) > 0:
                product_name = openfda["generic_name"][0]
                
            if "manufacturer_name" in openfda and len(openfda["manufacturer_name"]) > 0:
                manufacturer = openfda["manufacturer_name"][0]
    
    return product_name, manufacturer

def extract_adverse_events(faers_data):
    """Extract and categorize adverse events from FAERS data"""
    adverse_events = {}
    total_reports = 0
    
    if "results" in faers_data:
        total_reports = len(faers_data["results"])
        
        for result in faers_data["results"]:
            if "patient" in result and "reaction" in result["patient"]:
                for reaction in result["patient"]["reaction"]:
                    if "reactionmeddrapt" in reaction:
                        event = reaction["reactionmeddrapt"]
                        if event in adverse_events:
                            adverse_events[event] += 1
                        else:
                            adverse_events[event] = 1
    
    # Sort by frequency
    sorted_events = sorted(adverse_events.items(), key=lambda x: x[1], reverse=True)
    
    return sorted_events, total_reports

def generate_severity_assessment(adverse_events, total_reports):
    """Generate an assessment of event severity based on frequencies"""
    serious_terms = ["death", "fatal", "hospitalization", "disability", "life threatening", 
                    "congenital anomaly", "birth defect", "required intervention"]
    
    serious_events = []
    common_events = []
    
    # Calculate percentages and categorize
    for event, count in adverse_events:
        percentage = (count / total_reports) * 100
        
        event_data = {
            "name": event,
            "count": count,
            "percentage": percentage
        }
        
        # Check if event contains serious terms
        is_serious = any(term in event.lower() for term in serious_terms)
        
        if is_serious or percentage > 5:
            serious_events.append(event_data)
        elif percentage > 1:
            common_events.append(event_data)
    
    return serious_events, common_events

def format_date(date_str):
    """Convert date format"""
    try:
        date_obj = datetime.strptime(date_str, "%Y%m%d")
        return date_obj.strftime("%B %d, %Y")
    except:
        return date_str

def generate_cer_narrative(faers_data, product_name=""):
    """
    Generate a structured clinical evaluation report narrative
    
    Args:
        faers_data: Dictionary containing FAERS API response
        product_name: Optional product name override
        
    Returns:
        str: Formatted CER narrative text
    """
    # Extract product details if not provided
    if not product_name:
        extracted_name, manufacturer = get_product_details(faers_data)
        product_name = extracted_name or "Unknown Product"
        manufacturer_info = f" manufactured by {manufacturer}" if manufacturer else ""
    else:
        manufacturer_info = ""
    
    # Extract and analyze adverse events
    adverse_events, total_reports = extract_adverse_events(faers_data)
    serious_events, common_events = generate_severity_assessment(adverse_events, total_reports)
    
    # Begin constructing the narrative
    current_date = datetime.now().strftime("%B %d, %Y")
    
    narrative = f"""Clinical Evaluation Report (CER) for {product_name}{manufacturer_info}
Date of Report: {current_date}

SUMMARY OF SAFETY DATA ANALYSIS
==============================

This Clinical Evaluation Report presents an analysis of safety data for {product_name} based on {total_reports} adverse event reports from the FDA Adverse Event Reporting System (FAERS).

1. OVERVIEW OF REPORTED EVENTS
-----------------------------
Total number of adverse event reports analyzed: {total_reports}
Data collection period: Based on available FAERS data
"""

    # Add serious events section if applicable
    if serious_events:
        narrative += f"""
2. SIGNIFICANT ADVERSE EVENTS
---------------------------
The following significant adverse events were identified, listed by frequency:

"""
        for event in serious_events[:10]:  # Limit to top 10
            narrative += f"- {event['name']}: {event['count']} reports ({event['percentage']:.1f}% of total reports)\n"
    
    # Add common events section
    if common_events:
        narrative += f"""
3. COMMON ADVERSE EVENTS
----------------------
Other commonly reported adverse events include:

"""
        for event in common_events[:15]:  # Limit to top 15
            narrative += f"- {event['name']}: {event['count']} reports ({event['percentage']:.1f}% of total reports)\n"
    
    # Add clinical assessment
    narrative += f"""
4. CLINICAL ASSESSMENT
-------------------
Based on the frequency and nature of the reported adverse events, the following clinical assessment can be made:

"""
    
    # Generate appropriate assessment based on data
    if len(serious_events) > 5 and any(event['percentage'] > 10 for event in serious_events):
        narrative += "The data indicates a SIGNIFICANT SAFETY CONCERN. The high frequency of serious adverse events suggests the need for careful risk-benefit assessment and potentially enhanced monitoring or risk mitigation strategies."
    elif len(serious_events) > 0:
        narrative += "The safety profile shows NOTABLE ADVERSE EVENTS that warrant monitoring. While serious events have been reported, their frequency does not necessarily indicate a disproportionate risk compared to similar products."
    else:
        narrative += "The observed safety profile appears GENERALLY CONSISTENT with expectations. No unexpected serious concerns were identified in the analyzed dataset."
    
    # Add recommendations
    narrative += f"""

5. RECOMMENDATIONS
----------------
Based on this evaluation, the following recommendations are made:

"""
    
    if len(serious_events) > 5:
        narrative += """- Consider enhanced surveillance for the identified serious adverse events
- Review product labeling to ensure adequate warnings for the most significant events
- Evaluate potential risk factors that may contribute to serious adverse events
- Consider whether a Risk Evaluation and Mitigation Strategy (REMS) may be appropriate"""
    else:
        narrative += """- Continue routine monitoring of adverse events
- Consider updating product information if new patterns emerge
- No immediate changes to risk management activities are deemed necessary based on current data"""
    
    # Add conclusion
    narrative += f"""

6. CONCLUSION
-----------
This clinical evaluation based on {total_reports} FAERS reports provides insight into the post-market safety profile of {product_name}. """
    
    if total_reports < 10:
        narrative += "However, the limited number of reports suggests caution in drawing definitive conclusions. Continued monitoring is recommended."
    elif total_reports < 50:
        narrative += "While the dataset offers valuable insights, the moderate number of reports suggests that findings should be interpreted with appropriate caution."
    else:
        narrative += "The substantial number of reports provides a robust basis for assessing the product's safety profile in real-world use."
    
    return narrative

def main():
    """Command line entry point"""
    parser = argparse.ArgumentParser(description="Generate CER narrative from FAERS data")
    parser.add_argument("--ndc", required=True, help="NDC code to query")
    parser.add_argument("--input", help="Optional JSON file with FAERS data (if not provided, uses server/faers_client.py)")
    args = parser.parse_args()
    
    if args.input:
        # Load data from file
        with open(args.input, 'r') as f:
            faers_data = json.load(f)
    else:
        # Try to import the FAERS client
        try:
            sys.path.append(".")
            from server.faers_client import get_faers_data
            faers_data = get_faers_data(args.ndc)
        except ImportError:
            print("Error: server/faers_client.py not found and no input file provided", file=sys.stderr)
            sys.exit(1)
    
    # Generate and print narrative
    narrative = generate_cer_narrative(faers_data)
    print(narrative)

if __name__ == "__main__":
    main()