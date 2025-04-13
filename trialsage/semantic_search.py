#!/usr/bin/env python3
# trialsage/semantic_search.py
# Bridge script to perform semantic search against the CSR knowledge base

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
    from trialsage.services.deep_csr_analyzer import semantic_search, search_csr_sections
except ImportError:
    logger.error("Failed to import deep_csr_analyzer. Make sure it's in the correct path.")
    # Fallback function in case the import fails
    def semantic_search(query: str, top_k: int = 5, filter_by_csr: Optional[str] = None) -> List[Dict[str, Any]]:
        """Emergency fallback function for semantic search"""
        return [{"error": "Deep semantic search not available", "fallback": True}]
    
    def search_csr_sections(query: str, section_type: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """Emergency fallback function for section search"""
        return [{"error": "Deep section search not available", "fallback": True}]

def main():
    """
    Main function to perform semantic search against the CSR knowledge base
    
    Takes a filepath as a command-line argument, reads the query parameters,
    performs the search, and prints the result as JSON to stdout.
    """
    if len(sys.argv) != 2:
        logger.error("Usage: python3 semantic_search.py <filepath>")
        print(json.dumps({"error": "Invalid arguments", "results": []}))
        sys.exit(1)
    
    filepath = sys.argv[1]
    
    try:
        # Read the input parameters from the file
        with open(filepath, 'r', encoding='utf-8') as f:
            params = json.load(f)
        
        # Extract parameters
        query = params.get("query", "")
        top_k = params.get("topK", 5)
        filter_by_csr = params.get("filterByCsr")
        search_type = params.get("searchType", "general")
        
        if not query:
            logger.error("Query parameter is required")
            print(json.dumps({"error": "Query parameter is required", "results": []}))
            sys.exit(1)
        
        # Perform the search based on search type
        try:
            if search_type == "general":
                results = semantic_search(query, top_k, filter_by_csr)
            else:
                # Map search type to section type
                section_type_map = {
                    "endpoint": "endpoints",
                    "eligibility": "eligibility_criteria",
                    "safety": "safety_monitoring",
                    "efficacy": "efficacy_outcomes",
                    "protocol": "protocol_design",
                    "statistical": "statistical_methods",
                    "dropouts": "dropouts"
                }
                
                section_type = section_type_map.get(search_type, "endpoints")
                results = search_csr_sections(query, section_type, top_k)
            
            # Print the result as JSON
            print(json.dumps({
                "query": query,
                "searchType": search_type,
                "topK": top_k,
                "filterByCsr": filter_by_csr,
                "results": results
            }))
            
        except Exception as e:
            logger.error(f"Error performing semantic search: {str(e)}")
            print(json.dumps({
                "error": f"Failed to perform search: {str(e)}",
                "query": query,
                "results": []
            }))
            sys.exit(1)
        
    except Exception as e:
        logger.error(f"Error reading file {filepath}: {str(e)}")
        print(json.dumps({"error": f"Failed to read file: {str(e)}", "results": []}))
        sys.exit(1)

if __name__ == "__main__":
    main()