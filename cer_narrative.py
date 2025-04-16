"""
CER Narrative Generator

This module generates structured Clinical Evaluation Report (CER) narratives
using OpenAI's API based on FAERS data.
"""
import os
from typing import Dict, Any
import openai

def check_api_key():
    """Verify that the OpenAI API key is available"""
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OpenAI API key not found. Set the OPENAI_API_KEY environment variable.")
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
    # Initialize OpenAI with API key
    openai.api_key = check_api_key()
    
    # Extract product name from FAERS data if not provided
    if not product_name and "results" in faers_data and len(faers_data["results"]) > 0:
        result = faers_data["results"][0]
        if "openfda" in result and "brand_name" in result["openfda"]:
            product_name = result["openfda"]["brand_name"][0]
        elif "openfda" in result and "generic_name" in result["openfda"]:
            product_name = result["openfda"]["generic_name"][0]
    
    product_name = product_name or "the product"
    
    # Construct prompt for GPT
    prompt = f"""
    Generate a concise, well-structured Clinical Evaluation Report (CER) narrative based on the following FAERS (FDA Adverse Event Reporting System) data:
    
    {faers_data}
    
    The CER should include the following sections:
    
    1. INTRODUCTION
    - Brief overview of {product_name}
    - Purpose of this clinical evaluation
    
    2. ADVERSE EVENTS ANALYSIS
    - Summary of reported adverse events
    - Frequency and severity patterns
    - Demographic trends (if available)
    
    3. CLINICAL SIGNIFICANCE ASSESSMENT
    - Evaluation of the clinical impact of identified adverse events
    - Context within the known safety profile
    
    4. BENEFIT-RISK ANALYSIS
    - Evaluation of product benefits in relation to identified risks
    - Consideration of available alternatives
    
    5. COMPARATIVE EFFECTIVENESS
    - Comparison to similar products or therapeutic approaches (if data available)
    
    6. CONCLUSIONS AND RECOMMENDATIONS
    - Overall safety assessment
    - Recommendations for clinical practice
    - Suggestions for monitoring or additional evaluation
    
    Format the report in a professional, regulatory-compliant style suitable for submission to health authorities.
    """
    
    # Generate the narrative
    response = openai.ChatCompletion.create(
        model="gpt-4-turbo",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2,
    )
    
    return response.choices[0].message.content

def main():
    """Main entry point for the script"""
    import json
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python cer_narrative.py <path_to_faers_data.json> [product_name]")
        sys.exit(1)
        
    with open(sys.argv[1], 'r') as f:
        faers_data = json.load(f)
    
    product_name = sys.argv[2] if len(sys.argv) > 2 else None
    narrative = generate_cer_narrative(faers_data, product_name)
    print(narrative)

if __name__ == "__main__":
    main()