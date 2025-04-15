import os
import json
from openai import OpenAI

def format_faers_data(faers_data):
    """
    Format FAERS data into a more structured and readable format for the model
    
    Args:
        faers_data (dict): Raw FAERS API response
        
    Returns:
        str: Formatted FAERS data as a string
    """
    try:
        # Extract the relevant information from the FAERS data
        formatted_data = {
            "total_reports": faers_data.get("meta", {}).get("results", {}).get("total", 0),
            "adverse_events": []
        }
        
        # Extract adverse events from results
        for result in faers_data.get("results", []):
            event = {
                "reaction": result.get("patient", {}).get("reaction", []),
                "drug_info": result.get("patient", {}).get("drug", []),
                "patient_age": result.get("patient", {}).get("patientonsetage"),
                "patient_sex": result.get("patient", {}).get("patientsex"),
                "outcome": result.get("patient", {}).get("reaction", [{}])[0].get("reactionoutcome")
            }
            formatted_data["adverse_events"].append(event)
            
        return json.dumps(formatted_data, indent=2)
    except Exception as e:
        print(f"Error formatting FAERS data: {e}")
        return json.dumps(faers_data)

def generate_cer_narrative(faers_data, product_name=None):
    """
    Generate a CER narrative using OpenAI's GPT-4-turbo model
    
    Args:
        faers_data (dict): FAERS API response with adverse event data
        product_name (str, optional): Name of the product to include in the prompt
        
    Returns:
        str: Generated CER narrative text
    """
    if not os.environ.get("OPENAI_API_KEY"):
        return "Error: OpenAI API key is required to generate CER narratives. Please set the OPENAI_API_KEY environment variable."
    
    client = OpenAI()
    
    # Format the FAERS data for better readability
    formatted_data = format_faers_data(faers_data)
    
    # Include the product name in the prompt if provided
    product_context = f" for {product_name}" if product_name else ""
    
    prompt = f"""
    Generate a regulatory-compliant Clinical Evaluation Report (CER) narrative{product_context} using this FDA FAERS (FDA Adverse Event Reporting System) data:
    
    {formatted_data}
    
    The CER should follow MEDDEV 2.7/1 Rev. 4 guidelines and include these sections:
    
    1. Executive Summary
    2. Scope (device identification and classification)
    3. Adverse Events Analysis
       - Frequency and severity assessment
       - Patient demographic patterns
       - Notable signals and trends
    4. Clinical Significance Evaluation
    5. Benefit-Risk Analysis
    6. Comparative Safety Analysis (compared to similar products)
    7. Recommendations for Post-Market Surveillance
    
    Use a formal, objective tone suitable for regulatory submission. Include quantitative summaries where possible.
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Error generating CER narrative: {e}")
        return f"Error generating CER narrative: {str(e)}"