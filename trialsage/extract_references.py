#!/usr/bin/env python3
# trialsage/extract_references.py
# Bridge script to extract CSR references from text using the deep CSR analyzer

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
    from trialsage.services.deep_csr_analyzer import extract_csr_citations_from_text
except ImportError:
    logger.error("Failed to import deep_csr_analyzer. Make sure it's in the correct path.")
    # Fallback function in case the import fails
    def extract_csr_citations_from_text(text: str) -> List[Dict[str, Any]]:
        """Emergency fallback function for CSR citation extraction"""
        # Extract CSR IDs using regex pattern
        import re
        citations = []
        
        # Look for CSR mentions
        csr_pattern = r'CSR[_\s-]?(\w+)'
        matches = re.finditer(csr_pattern, text, re.IGNORECASE)
        
        for match in matches:
            csr_id = match.group(1)
            context = text[max(0, match.start() - 50):min(len(text), match.end() + 50)]
            
            citations.append({
                "csr_id": csr_id,
                "citation_type": "explicit",
                "relevance": "medium",
                "context": context
            })
        
        # If no explicit citations found, add semantic match based on keywords
        if not citations:
            keywords = ["study", "trial", "clinical", "outcome", "endpoint", "efficacy"]
            for keyword in keywords:
                if keyword in text.lower():
                    citations.append({
                        "csr_id": "semantic_match",
                        "citation_type": "semantic",
                        "relevance": "low",
                        "context": f"Contains keyword: {keyword}"
                    })
                    break
        
        return citations

def main():
    """
    Main function to extract CSR references from an input file
    
    Takes a filepath as a command-line argument, reads the text,
    extracts CSR references, and prints the result as JSON to stdout.
    """
    if len(sys.argv) != 2:
        logger.error("Usage: python3 extract_references.py <filepath>")
        print(json.dumps([{"error": "Invalid arguments"}]))
        sys.exit(1)
    
    filepath = sys.argv[1]
    
    try:
        # Read the input text from the file
        with open(filepath, 'r', encoding='utf-8') as f:
            text = f.read()
        
        # Extract CSR references
        try:
            citations = extract_csr_citations_from_text(text)
            
            # Ensure the citations have the expected format
            formatted_citations = []
            for citation in citations:
                formatted_citation = {
                    "csr_id": citation.get("csr_id", "unknown"),
                    "citation_type": citation.get("citation_type", "semantic"),
                    "relevance": citation.get("relevance", "medium"),
                    "context": citation.get("context", "")
                }
                
                # Add metadata if available
                if "metadata" in citation:
                    formatted_citation["metadata"] = citation["metadata"]
                
                # Add title if available
                if "title" in citation:
                    formatted_citation["title"] = citation["title"]
                
                formatted_citations.append(formatted_citation)
            
            # Print the result as JSON
            print(json.dumps(formatted_citations))
            
        except Exception as e:
            logger.error(f"Error extracting CSR references: {str(e)}")
            print(json.dumps([{"error": f"Failed to extract references: {str(e)}"}]))
            sys.exit(1)
        
    except Exception as e:
        logger.error(f"Error reading file {filepath}: {str(e)}")
        print(json.dumps([{"error": f"Failed to read file: {str(e)}"}]))
        sys.exit(1)

if __name__ == "__main__":
    main()