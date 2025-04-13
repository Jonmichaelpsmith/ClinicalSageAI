#!/usr/bin/env python3
# trialsage/deep_csr_analyzer.py
# Deep analysis of CSR documents to extract risks, insights, and design patterns

import os
import sys
import re
import json
from typing import List, Dict, Any, Optional
import logging
import random  # For fallback simulation only

# Configure logging
logging.basicConfig(level=logging.INFO, 
                   format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Check for OpenAI API key
def is_openai_api_key_available() -> bool:
    return os.environ.get("OPENAI_API_KEY") is not None

# Try to import OpenAI - used for advanced semantic analysis
try:
    import openai
    import numpy as np
    
    # Set OpenAI API key if available
    api_key = os.environ.get("OPENAI_API_KEY")
    if api_key:
        openai.api_key = api_key
        OPENAI_AVAILABLE = True
        logger.info("OpenAI API key found, enabling advanced analysis capabilities")
    else:
        OPENAI_AVAILABLE = False
        logger.warning("OpenAI API key not found. Using fallback analysis methods")
except ImportError:
    OPENAI_AVAILABLE = False
    logger.warning("OpenAI module not available. Using fallback analysis methods")

def extract_risk_factors_from_protocol(protocol_text: str) -> List[Dict[str, Any]]:
    """
    Extract potential risk factors and concerns from a protocol design
    
    Args:
        protocol_text: The protocol text to analyze
        
    Returns:
        List of identified risk factors with severity and justifications
    """
    if not protocol_text.strip():
        return []
    
    # If OpenAI is available, use deep analysis
    if OPENAI_AVAILABLE and is_openai_api_key_available():
        try:
            # Create a prompt for GPT to analyze risk factors
            prompt = f"""
            You are a clinical trial risk analysis expert. Analyze the following protocol text and identify 
            any potential risk factors, concerns, or areas that might need improvement.
            
            Protocol:
            {protocol_text}
            
            For each risk you identify, provide:
            1. A title for the risk
            2. The severity level (low, medium, high)
            3. A detailed explanation with specific reasons
            4. Suggested mitigation strategies
            
            Format as JSON array with keys: "title", "severity", "explanation", "mitigation"
            """
            
            response = openai.ChatCompletion.create(
                model="gpt-4o", # the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
                messages=[
                    {
                        "role": "system", 
                        "content": "You are a clinical trial expert who identifies risks in study protocols and provides detailed, evidence-based analysis formatted as JSON."
                    },
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.2
            )
            
            # Extract JSON from response
            result_text = response.choices[0].message.content
            result = json.loads(result_text)
            
            # Ensure we have the expected format
            if "risks" not in result:
                result = {"risks": result}
                
            return result["risks"]
            
        except Exception as e:
            logger.error(f"Error in OpenAI analysis: {str(e)}")
            # Fall back to rule-based analysis
            return rule_based_risk_analysis(protocol_text)
    else:
        return rule_based_risk_analysis(protocol_text)

def rule_based_risk_analysis(protocol_text: str) -> List[Dict[str, Any]]:
    """Rule-based risk analysis as a fallback method"""
    risks = []
    
    # Sample risk patterns (these would be more sophisticated in a real implementation)
    risk_patterns = [
        {
            "pattern": r"sample\s+size.{0,20}(\d+)",
            "check": lambda m: int(m.group(1)) < 100,
            "title": "Small Sample Size",
            "severity": "medium",
            "explanation": "Sample size appears to be less than 100 participants, which may limit statistical power.",
            "mitigation": "Consider increasing sample size or employing more sensitive endpoints."
        },
        {
            "pattern": r"duration.{0,20}(\d+)\s*weeks?",
            "check": lambda m: int(m.group(1)) < 12,
            "title": "Short Study Duration",
            "severity": "medium", 
            "explanation": "Study duration is less than 12 weeks, which may be insufficient for certain endpoints.",
            "mitigation": "Evaluate if duration is sufficient for the selected endpoint and indication."
        },
        {
            "pattern": r"placebo",
            "check": lambda m: True,
            "title": "Placebo Control Ethics",
            "severity": "low",
            "explanation": "Placebo-controlled design may raise ethical concerns if standard therapy exists.",
            "mitigation": "Consider active control or add-on design if standard of care is available."
        }
    ]
    
    # Check each pattern
    for risk in risk_patterns:
        matches = re.finditer(risk["pattern"], protocol_text, re.IGNORECASE)
        for match in matches:
            if risk["check"](match):
                risks.append({
                    "title": risk["title"],
                    "severity": risk["severity"],
                    "explanation": risk["explanation"],
                    "mitigation": risk["mitigation"]
                })
                break  # Only add each risk type once
    
    # Add a fallback risk if none were found
    if not risks:
        risks.append({
            "title": "General Risk Assessment Needed",
            "severity": "low",
            "explanation": "A detailed risk assessment should be performed for this protocol.",
            "mitigation": "Conduct a formal risk assessment with stakeholders and experts.",
            "fallback": True
        })
    
    return risks

def main():
    """
    Main function to run when executed as a script
    """
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Invalid arguments", "usage": "python deep_csr_analyzer.py <input_file>"}))
        sys.exit(1)
    
    filepath = sys.argv[1]
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        action = data.get("action", "")
        text = data.get("text", "")
        
        if action == "extract_risks":
            result = extract_risk_factors_from_protocol(text)
            print(json.dumps({"risks": result}))
        else:
            print(json.dumps({"error": f"Unknown action: {action}"}))
            
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()