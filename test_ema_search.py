#!/usr/bin/env python3
"""
EMA Web Portal Search Test
-------------------------
This script tests searching for CSRs on the EMA clinical data portal.
"""

import sys
import requests
from bs4 import BeautifulSoup
import logging
import random

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("ema-search-test")

# User Agents
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0"
]

def search_ema_portal(search_term=""):
    """Search for CSRs on the EMA clinical data portal"""
    session = requests.Session()
    
    # Set headers to mimic a browser
    user_agent = random.choice(USER_AGENTS)
    session.headers.update({
        'User-Agent': user_agent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
    })
    
    try:
        # Try to access the search page with a search term
        search_url = "https://clinicaldata.ema.europa.eu/web/cdp/search"
        
        # Build query parameters
        params = {
            'sort': 'desc,medicine_name'
        }
        
        if search_term:
            params['q'] = search_term
        
        logger.info(f"Searching EMA portal with term: '{search_term}'...")
        
        search_response = session.get(search_url, params=params, timeout=15)
        
        if search_response.status_code != 200:
            logger.error(f"Failed to access search page: {search_response.status_code}")
            return False, []
        
        logger.info("✅ Successfully accessed the search page")
        
        # Parse the search page to extract results
        soup = BeautifulSoup(search_response.text, 'html.parser')
        
        # Check for search results
        search_results = soup.select('.search-result-row')
        
        logger.info(f"Found {len(search_results)} search results on the page")
        
        # Extract information from search results
        results = []
        
        for idx, result in enumerate(search_results[:5]):  # Limit to first 5 for testing
            try:
                # Extract title
                title_elem = result.select_one('.medicine-title')
                title = title_elem.text.strip() if title_elem else "Unknown"
                
                # Extract procedure number
                proc_elem = result.select_one('.procedure-number')
                procedure_number = proc_elem.text.strip() if proc_elem else "Unknown"
                
                # Extract substance
                substance_elem = result.select_one('.active-substance-value')
                substance = substance_elem.text.strip() if substance_elem else "Unknown"
                
                # Extract therapeutic area
                area_elem = result.select_one('.therapeutic-area-value')
                therapeutic_area = area_elem.text.strip() if area_elem else "Unknown"
                
                # Extract details link
                details_url = None
                links = result.select('a')
                for link in links:
                    href = link.get('href', '')
                    if 'clinical-details' in href:
                        details_url = href
                        break
                
                results.append({
                    'index': idx + 1,
                    'title': title,
                    'procedure': procedure_number,
                    'substance': substance,
                    'area': therapeutic_area,
                    'details_url': details_url
                })
            except Exception as e:
                logger.error(f"Error extracting data from result {idx+1}: {e}")
        
        return True, results
    
    except Exception as e:
        logger.error(f"Error searching EMA portal: {e}")
        return False, []

def test_search_terms():
    """Test various search terms to find CSRs"""
    search_terms = [
        "",  # Empty search returns latest CSRs
        "oncology",  # Therapeutic area
        "diabetes",  # Disease
        "COVID-19",  # Specific disease
        "phase 3",  # Study phase
    ]
    
    success_count = 0
    
    print("\nEMA Clinical Data Portal Search Test")
    print("===================================\n")
    
    for term in search_terms:
        print(f"\nTesting search term: '{term}'")
        print("-" * (23 + len(term)))
        
        success, results = search_ema_portal(term)
        
        if success:
            success_count += 1
            print(f"✅ Search successful with {len(results)} results found")
            
            if results:
                print("\nSample results:")
                for result in results:
                    print(f"\n  Result #{result['index']}:")
                    print(f"  - Title: {result['title']}")
                    print(f"  - Procedure: {result['procedure']}")
                    print(f"  - Substance: {result['substance']}")
                    print(f"  - Area: {result['area']}")
                    print(f"  - Details URL: {result['details_url']}")
        else:
            print(f"❌ Search failed with term: '{term}'")
    
    print(f"\nSearch Test Summary: {success_count}/{len(search_terms)} successful searches")
    
    if success_count > 0:
        print("\n✅ The EMA Clinical Data Portal search is working!")
        print("You can proceed with downloading CSRs using the web-based approach.")
        return True
    else:
        print("\n❌ All search attempts failed on the EMA Clinical Data Portal.")
        print("The web-based download approach may not work properly.")
        return False

if __name__ == "__main__":
    success = test_search_terms()
    sys.exit(0 if success else 1)