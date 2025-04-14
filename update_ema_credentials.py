#!/usr/bin/env python3
"""
EMA API Credentials Update
-------------------------
This script obtains and updates the EMA API credentials (access tokens)
required for accessing the EMA API endpoints.

It handles:
1. Obtaining tokens using client credentials flow
2. Storing tokens with expiration time
3. Refreshing tokens when they expire
4. Testing the token against the EMA API
"""

import os
import sys
import time
import json
import logging
import argparse
from datetime import datetime, timedelta
import requests
from typing import Dict, Any, Optional, Tuple

# Constants
CREDENTIALS_FILE = "ema_api_credentials.json"
TOKEN_ENDPOINT = "https://login.microsoftonline.com/bc9dc15c-61bc-4f03-b60b-e5b6d8922839/oauth2/v2.0/token"
API_SCOPE = "api://euema.onmicrosoft.com/upd-apim-secured/.default"
API_HOST = "spor-prod-bk.azure-api.net"  # Default host
ALTERNATIVE_HOSTS = [
    "spor-dev-bk.azure-api.net",
    "spor-dev.azure-api.net",
    "spor-api.ema.europa.eu"
]
TEST_ENDPOINT = "/humanmedicines/clinicalreports/search"

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler("ema_credentials.log")
    ]
)
logger = logging.getLogger("ema-credentials")

class EmaCredentials:
    """Handles EMA API credentials management"""
    
    def __init__(self, credentials_file=CREDENTIALS_FILE):
        """Initialize the credentials manager"""
        self.credentials_file = credentials_file
        self.credentials = self._load_credentials()
        
        # Make sure we have client ID and secret
        self._ensure_client_credentials()
    
    def _load_credentials(self) -> Dict[str, Any]:
        """Load credentials from file"""
        if os.path.exists(self.credentials_file):
            try:
                with open(self.credentials_file, 'r') as f:
                    return json.load(f)
            except json.JSONDecodeError:
                logger.warning(f"Credentials file {self.credentials_file} is corrupt. Creating a new one.")
        
        # Default credentials structure
        return {
            'client_id': os.environ.get('EMA_CLIENT_ID', ''),
            'client_secret': os.environ.get('EMA_CLIENT_SECRET', ''),
            'access_token': '',
            'token_type': '',
            'expires_at': 0,
            'preferred_host': API_HOST,
            'last_updated': datetime.now().isoformat()
        }
    
    def _save_credentials(self):
        """Save credentials to file"""
        self.credentials['last_updated'] = datetime.now().isoformat()
        
        with open(self.credentials_file, 'w') as f:
            json.dump(self.credentials, f, indent=2)
    
    def _ensure_client_credentials(self):
        """Ensure client credentials are available"""
        if not self.credentials['client_id'] or not self.credentials['client_secret']:
            # Try to get from environment variables
            self.credentials['client_id'] = os.environ.get('EMA_CLIENT_ID', '')
            self.credentials['client_secret'] = os.environ.get('EMA_CLIENT_SECRET', '')
            
            if not self.credentials['client_id'] or not self.credentials['client_secret']:
                logger.warning("EMA API client credentials not found. Token acquisition will fail.")
                logger.warning("Set EMA_CLIENT_ID and EMA_CLIENT_SECRET environment variables.")
    
    def get_token(self, force_refresh=False) -> Optional[str]:
        """
        Get a valid access token, obtaining a new one if needed
        
        Args:
            force_refresh: Force token refresh even if the current one is still valid
            
        Returns:
            Valid access token or None if token acquisition fails
        """
        # Check if token is still valid (with 5-minute buffer)
        current_time = time.time()
        token_valid = (
            self.credentials['access_token'] and 
            self.credentials['expires_at'] > current_time + 300
        )
        
        if token_valid and not force_refresh:
            logger.info("Using existing token")
            return self.credentials['access_token']
        
        # Refresh the token
        client_id = self.credentials['client_id']
        client_secret = self.credentials['client_secret']
        
        if not client_id or not client_secret:
            logger.error("Missing client credentials")
            return None
        
        try:
            logger.info("Requesting new access token")
            
            data = {
                'grant_type': 'client_credentials',
                'client_id': client_id,
                'client_secret': client_secret,
                'scope': API_SCOPE
            }
            
            response = requests.post(TOKEN_ENDPOINT, data=data, timeout=30)
            
            if response.status_code == 200:
                token_data = response.json()
                
                # Calculate expiration time
                expires_in = token_data.get('expires_in', 3600)
                expires_at = current_time + expires_in
                
                # Update and save credentials
                self.credentials['access_token'] = token_data.get('access_token', '')
                self.credentials['token_type'] = token_data.get('token_type', 'Bearer')
                self.credentials['expires_at'] = expires_at
                
                self._save_credentials()
                
                logger.info(f"Successfully obtained new token (expires in {expires_in} seconds)")
                return self.credentials['access_token']
            else:
                logger.error(f"Token request failed: {response.status_code} {response.text}")
                return None
        except Exception as e:
            logger.error(f"Error requesting token: {e}")
            return None
    
    def get_headers(self) -> Dict[str, str]:
        """Get authorization headers with a valid token"""
        token = self.get_token()
        
        if not token:
            logger.error("Failed to get valid token for headers")
            return {}
        
        return {
            'Authorization': f"Bearer {token}",
            'Content-Type': 'application/json'
        }
    
    def test_api_connection(self, all_hosts=False) -> Tuple[bool, Optional[str]]:
        """
        Test connection to the EMA API
        
        Args:
            all_hosts: Test all alternative hosts if the preferred one fails
            
        Returns:
            Tuple of (success flag, working host or error message)
        """
        # Get headers with valid token
        headers = self.get_headers()
        
        if not headers:
            return False, "Failed to get valid authorization headers"
        
        # Determine which hosts to test
        hosts_to_test = [self.credentials['preferred_host']]
        
        if all_hosts:
            hosts_to_test.extend([h for h in ALTERNATIVE_HOSTS if h != self.credentials['preferred_host']])
        
        # Test each host
        working_host = None
        error_messages = []
        
        for host in hosts_to_test:
            try:
                test_url = f"https://{host}{TEST_ENDPOINT}"
                
                logger.info(f"Testing API connection to {host}")
                
                # Try to resolve the host
                try:
                    import socket
                    ip_addr = socket.gethostbyname(host)
                    logger.info(f"Resolved {host} to {ip_addr}")
                except Exception as e:
                    logger.warning(f"Failed to resolve hostname {host}: {e}")
                    error_messages.append(f"DNS resolution failed for {host}: {e}")
                    continue
                
                # Try with a minimal query to reduce payload size
                params = {
                    "page": 0,
                    "size": 1
                }
                
                response = requests.get(test_url, headers=headers, params=params, timeout=30)
                
                if response.status_code == 200:
                    logger.info(f"Successfully connected to {host}")
                    working_host = host
                    
                    # Update preferred host if different
                    if self.credentials['preferred_host'] != host:
                        self.credentials['preferred_host'] = host
                        self._save_credentials()
                    
                    return True, working_host
                else:
                    error = f"API call to {host} failed: {response.status_code} {response.text}"
                    logger.warning(error)
                    error_messages.append(error)
            except requests.exceptions.RequestException as e:
                error = f"Connection error to {host}: {e}"
                logger.warning(error)
                error_messages.append(error)
            except Exception as e:
                error = f"Unexpected error with {host}: {e}"
                logger.error(error)
                error_messages.append(error)
        
        # If we get here, all hosts failed
        error_summary = "\n".join(error_messages)
        return False, f"Failed to connect to any EMA API host:\n{error_summary}"
    
    def set_client_credentials(self, client_id: str, client_secret: str) -> bool:
        """
        Set client credentials and test them
        
        Args:
            client_id: EMA API client ID
            client_secret: EMA API client secret
            
        Returns:
            Success flag
        """
        # Update credentials
        self.credentials['client_id'] = client_id
        self.credentials['client_secret'] = client_secret
        
        # Clear the current token to force a refresh
        self.credentials['access_token'] = ''
        self.credentials['expires_at'] = 0
        
        # Save credentials
        self._save_credentials()
        
        # Test the new credentials
        token = self.get_token(force_refresh=True)
        
        if not token:
            logger.error("Failed to get token with new credentials")
            return False
        
        return True

def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(description="Manage EMA API credentials")
    parser.add_argument("--client-id", help="EMA API client ID")
    parser.add_argument("--client-secret", help="EMA API client secret")
    parser.add_argument("--test", action="store_true", help="Test API connection")
    parser.add_argument("--refresh", action="store_true", help="Force token refresh")
    parser.add_argument("--all-hosts", action="store_true", help="Test all alternative hosts")
    args = parser.parse_args()
    
    credentials = EmaCredentials()
    
    # Set client credentials if provided
    if args.client_id and args.client_secret:
        if credentials.set_client_credentials(args.client_id, args.client_secret):
            print("Successfully set new client credentials")
        else:
            print("Failed to set new client credentials")
            return 1
    
    # Get token, force refresh if requested
    token = credentials.get_token(force_refresh=args.refresh)
    
    if not token:
        print("Failed to get valid token")
        return 1
    
    print(f"Token: {token[:20]}...{token[-5:]} (truncated)")
    
    # Print expiration time
    expires_at = datetime.fromtimestamp(credentials.credentials['expires_at'])
    expires_in = int(credentials.credentials['expires_at'] - time.time())
    print(f"Expires in: {expires_in} seconds ({expires_at.isoformat()})")
    
    # Test API connection if requested
    if args.test:
        success, result = credentials.test_api_connection(all_hosts=args.all_hosts)
        
        if success:
            print(f"Successfully connected to EMA API host: {result}")
        else:
            print(f"Failed to connect to EMA API: {result}")
            return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())