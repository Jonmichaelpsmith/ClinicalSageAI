#!/usr/bin/env python3
"""
Check EMA API Access
------------------
This script checks access to the EMA API endpoints and diagnostics connection issues.
"""

import os
import sys
import requests
import json
import time
import logging
import socket
import argparse
from urllib.parse import urlparse
from typing import Dict, Any, List, Tuple, Optional

# Constants
CLIENT_ID = os.environ.get("EMA_CLIENT_ID")
CLIENT_SECRET = os.environ.get("EMA_CLIENT_SECRET")
TOKEN_URL = "https://login.microsoftonline.com/bc9dc15c-61bc-4f03-b60b-e5b6d8922839/oauth2/v2.0/token"
API_BASE = "https://app-prd-upd-api.azurewebsites.net/api"
API_SCOPE = "api://euema.onmicrosoft.com/upd-apim-secured/.default"
LOG_FILE = "ema_access_check.log"

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(LOG_FILE)
    ]
)
logger = logging.getLogger("ema-access-check")

def check_dns_resolution(host: str) -> Tuple[bool, str]:
    """
    Check DNS resolution for a host
    
    Args:
        host: Hostname to resolve
        
    Returns:
        Tuple of (success flag, IP address or error message)
    """
    try:
        logger.info(f"Resolving host: {host}")
        ip_address = socket.gethostbyname(host)
        logger.info(f"Successfully resolved {host} to {ip_address}")
        return True, ip_address
    except socket.gaierror as e:
        error_message = f"DNS resolution failed for {host}: {e}"
        logger.error(error_message)
        return False, error_message

def check_connection(url: str) -> Tuple[bool, Dict[str, Any]]:
    """
    Check connection to a URL
    
    Args:
        url: URL to check
        
    Returns:
        Tuple of (success flag, response info or error message)
    """
    try:
        logger.info(f"Checking connection to: {url}")
        response = requests.get(url, timeout=10)
        
        result = {
            "status_code": response.status_code,
            "headers": dict(response.headers),
            "content_length": len(response.content)
        }
        
        if response.status_code < 400:
            logger.info(f"Successfully connected to {url} with status {response.status_code}")
            return True, result
        else:
            logger.warning(f"Connection to {url} returned status {response.status_code}")
            return False, result
    except requests.RequestException as e:
        error_message = f"Connection failed to {url}: {e}"
        logger.error(error_message)
        return False, {"error": str(e)}

def get_token() -> Tuple[bool, Optional[str]]:
    """
    Get an access token from the EMA token endpoint
    
    Returns:
        Tuple of (success flag, token or error message)
    """
    if not CLIENT_ID or not CLIENT_SECRET:
        error = "Missing EMA API credentials (EMA_CLIENT_ID or EMA_CLIENT_SECRET environment variables)"
        logger.error(error)
        return False, error
    
    try:
        logger.info(f"Requesting access token from {TOKEN_URL}")
        
        data = {
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
            "scope": API_SCOPE,
            "grant_type": "client_credentials"
        }
        
        response = requests.post(TOKEN_URL, data=data, timeout=10)
        
        if response.status_code == 200:
            token_data = response.json()
            token = token_data.get("access_token")
            
            if token:
                logger.info(f"Successfully obtained access token (length: {len(token)})")
                return True, token
            else:
                logger.error("Access token not found in response")
                return False, f"No access token in response: {token_data}"
        else:
            logger.error(f"Token request failed with status {response.status_code}: {response.text}")
            return False, f"Token request failed: {response.text}"
    except Exception as e:
        logger.error(f"Error getting access token: {e}")
        return False, f"Error getting access token: {e}"

def check_ema_endpoints(token: str) -> Dict[str, Any]:
    """
    Check access to EMA API endpoints
    
    Args:
        token: Access token
        
    Returns:
        Dictionary with endpoint status
    """
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    endpoints = {
        # Check API endpoints
        "therapeutic_areas": f"{API_BASE}/therapeutic-areas",
        "search": f"{API_BASE}/search",
        "clinical_trials": f"{API_BASE}/clinical-trials",
        "documents": f"{API_BASE}/documents"
    }
    
    results = {}
    
    for name, url in endpoints.items():
        try:
            logger.info(f"Checking endpoint: {name} at {url}")
            
            response = requests.get(url, headers=headers, timeout=15)
            
            results[name] = {
                "status_code": response.status_code,
                "success": response.status_code < 400,
                "content_length": len(response.content),
                "content_type": response.headers.get("Content-Type")
            }
            
            # Check sample of content for search and document endpoints
            if name == "search" and response.status_code == 200:
                try:
                    data = response.json()
                    results[name]["items_count"] = len(data.get("value", []))
                except Exception as e:
                    results[name]["parse_error"] = str(e)
            
            if name == "documents" and response.status_code == 200:
                try:
                    data = response.json()
                    results[name]["items_count"] = len(data.get("value", []))
                except Exception as e:
                    results[name]["parse_error"] = str(e)
                    
            # Check clinical trial details
            if name == "clinical_trials" and response.status_code == 200:
                try:
                    data = response.json()
                    trials = data.get("value", [])
                    results[name]["items_count"] = len(trials)
                    
                    # Check details for first trial if available
                    if trials and 'clinical-details' in trials[0].get("_links", {}) and trials[0].get("_links", {}).get("clinical-details", "").startswith(API_BASE):
                        detail_url = trials[0]["_links"]["clinical-details"]
                        detail_response = requests.get(detail_url, headers=headers, timeout=15)
                        
                        results[name]["detail_check"] = {
                            "status_code": detail_response.status_code,
                            "success": detail_response.status_code < 400,
                            "content_length": len(detail_response.content)
                        }
                except Exception as e:
                    results[name]["detail_error"] = str(e)
            
            # Check document details
            if name == "documents" and response.status_code == 200:
                try:
                    data = response.json()
                    docs = data.get("value", [])
                    
                    # Check details for first document if available
                    if docs and '/documents/' in docs[0].get("_links", {}).get("self", "") and docs[0].get("_links", {}).get("self", "").startswith(API_BASE):
                        doc_url = docs[0]["_links"]["self"]
                        doc_response = requests.get(doc_url, headers=headers, timeout=15)
                        
                        results[name]["document_check"] = {
                            "status_code": doc_response.status_code,
                            "success": doc_response.status_code < 400,
                            "content_length": len(doc_response.content)
                        }
                except Exception as e:
                    results[name]["document_error"] = str(e)
            
            if response.status_code >= 400:
                logger.warning(f"Endpoint {name} returned status {response.status_code}: {response.text}")
            else:
                logger.info(f"Successfully accessed endpoint {name} with status {response.status_code}")
            
        except Exception as e:
            logger.error(f"Error checking endpoint {name}: {e}")
            results[name] = {"error": str(e)}
    
    return results

def print_diagnostic_info():
    """Print diagnostic information about the system and network"""
    print("\nSystem & Network Diagnostics")
    print("===========================")
    
    # Check DNS servers
    print("\nDNS Configuration:")
    try:
        with open("/etc/resolv.conf", "r") as f:
            for line in f:
                if line.strip().startswith("nameserver"):
                    print(f"  {line.strip()}")
    except Exception as e:
        print(f"  Error reading DNS configuration: {e}")
    
    # Check if we can resolve common domains
    common_domains = ["google.com", "microsoft.com", "ema.europa.eu", "login.microsoftonline.com"]
    print("\nDNS Resolution Tests:")
    for domain in common_domains:
        success, result = check_dns_resolution(domain)
        print(f"  {domain}: {'✓' if success else '✗'} - {result}")
    
    # Check if we can connect to common sites
    print("\nConnection Tests:")
    common_urls = ["https://google.com", "https://microsoft.com", "https://ema.europa.eu"]
    for url in common_urls:
        success, result = check_connection(url)
        print(f"  {url}: {'✓' if success else '✗'} - Status: {result.get('status_code', 'N/A')}")
    
    # Check hosts file
    print("\nHosts File:")
    try:
        with open("/etc/hosts", "r") as f:
            content = f.read().strip()
            if content:
                print(f"  {content}")
            else:
                print("  No custom entries")
    except Exception as e:
        print(f"  Error reading hosts file: {e}")

def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(description="Check EMA API access")
    parser.add_argument("--token-only", action="store_true", help="Only check token acquisition")
    parser.add_argument("--diagnostic", action="store_true", help="Run network diagnostics")
    args = parser.parse_args()
    
    # Run diagnostics if requested
    if args.diagnostic:
        print_diagnostic_info()
        return 0
    
    print("\nEMA API Access Check")
    print("===================\n")
    
    # Check token acquisition
    token_success, token_result = get_token()
    
    if not token_success:
        print(f"❌ Token acquisition failed: {token_result}")
        return 1
    
    print("✅ Successfully acquired access token")
    
    if args.token_only:
        return 0
    
    # Check API endpoints if token was acquired
    endpoint_results = check_ema_endpoints(token_result)
    
    # Print results
    print("\nEndpoint Checks:")
    for endpoint, result in endpoint_results.items():
        if "error" in result:
            print(f"  ❌ {endpoint}: Error - {result['error']}")
        else:
            status = result.get("status_code", "N/A")
            success = result.get("success", False)
            print(f"  {'✅' if success else '❌'} {endpoint}: Status {status}")
            
            if "items_count" in result:
                print(f"     Items: {result['items_count']}")
            
            if "detail_check" in result:
                detail_success = result["detail_check"].get("success", False)
                detail_status = result["detail_check"].get("status_code", "N/A")
                print(f"     Detail check: {'✅' if detail_success else '❌'} Status {detail_status}")
            
            if "document_check" in result:
                doc_success = result["document_check"].get("success", False)
                doc_status = result["document_check"].get("status_code", "N/A")
                print(f"     Document check: {'✅' if doc_success else '❌'} Status {doc_status}")
    
    # Check overall success
    all_success = all(
        result.get("success", False) 
        for result in endpoint_results.values() 
        if "error" not in result
    )
    
    if all_success:
        print("\n✅ All endpoint checks passed successfully")
        return 0
    else:
        print("\n❌ Some endpoint checks failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())