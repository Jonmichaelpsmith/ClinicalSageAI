#!/usr/bin/env python3
# trialsage/design_recommendations.py
# Bridge script to generate evidence-based study design recommendations

import os
import sys
import json
from typing import List, Dict, Any, Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, 
                   format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Add the parent directory to the path so we can import our modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from trialsage.services.deep_csr_analyzer import generate_study_design_recommendations
except ImportError:
    logger.error("Failed to import deep_csr_analyzer. Make sure it's in the correct path.")
    # Fallback function in case the import fails
    def generate_study_design_recommendations(
        indication: str, 
        phase: str, 
        primary_endpoint: Optional[str] = None
    ) -> Dict[str, Any]:
        """Emergency fallback function for study design recommendations"""
        return {
            "error": "Deep study design recommendations not available",
            "fallback": True,
            "query": {
                "indication": indication,
                "phase": phase,
                "primary_endpoint": primary_endpoint
            },
            "recommendations": [
                "Use a robust randomization method to minimize selection bias",
                "Consider including patient-reported outcomes as secondary endpoints",
                "Plan for at least 15% dropout in sample size calculations"
            ]
        }

def main():
    """
    Main function to generate evidence-based study design recommendations
    
    Takes a filepath as a command-line argument, reads the design parameters,
    generates recommendations, and prints the result as JSON to stdout.
    """
    if len(sys.argv) != 2:
        logger.error("Usage: python3 design_recommendations.py <filepath>")
        print(json.dumps({"error": "Invalid arguments", "recommendations": []}))
        sys.exit(1)
    
    filepath = sys.argv[1]
    
    try:
        # Read the input parameters from the file
        with open(filepath, 'r', encoding='utf-8') as f:
            params = json.load(f)
        
        # Extract parameters
        indication = params.get("indication", "")
        phase = params.get("phase", "")
        primary_endpoint = params.get("primaryEndpoint")
        secondary_endpoints = params.get("secondaryEndpoints", [])
        population = params.get("population", "")
        context = params.get("context", "")
        
        if not indication or not phase:
            logger.error("Indication and phase parameters are required")
            print(json.dumps({
                "error": "Indication and phase parameters are required", 
                "recommendations": []
            }))
            sys.exit(1)
        
        # Generate recommendations
        try:
            results = generate_study_design_recommendations(
                indication=indication,
                phase=phase,
                primary_endpoint=primary_endpoint
            )
            
            # Enhance with additional context if available
            if population and "query" in results:
                results["query"]["population"] = population
            
            if secondary_endpoints and "query" in results:
                results["query"]["secondary_endpoints"] = secondary_endpoints
            
            # Print the result as JSON
            print(json.dumps(results))
            
        except Exception as e:
            logger.error(f"Error generating study design recommendations: {str(e)}")
            print(json.dumps({
                "error": f"Failed to generate recommendations: {str(e)}",
                "query": {
                    "indication": indication,
                    "phase": phase,
                    "primary_endpoint": primary_endpoint
                },
                "recommendations": []
            }))
            sys.exit(1)
        
    except Exception as e:
        logger.error(f"Error reading file {filepath}: {str(e)}")
        print(json.dumps({"error": f"Failed to read file: {str(e)}", "recommendations": []}))
        sys.exit(1)

if __name__ == "__main__":
    main()