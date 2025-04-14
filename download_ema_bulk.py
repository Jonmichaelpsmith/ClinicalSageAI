#!/usr/bin/env python3
"""
Enhanced EMA Bulk CSR Downloader
--------------------------------
This script downloads Clinical Study Reports (CSRs) in bulk from the EMA API,
with robust error handling, connectivity testing, and fallback options.

It uses the credentials from update_ema_credentials.py and tests multiple
endpoint options to find a working connection.
"""

import os
import sys
import json
import time
import logging
import requests
import sqlite3
import argparse
import socket
from urllib.parse import urlparse
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Dict, List, Tuple, Any, Optional, Set

# Constants
DEFAULT_BATCH_SIZE = 10
MAX_WORKERS = 4
DOWNLOAD_DIR = "downloaded_csrs"
PROGRESS_FILE = "ema_download_progress.json"
DB_FILE = "data/vector_store/csr_metadata.db"
RETRY_ATTEMPTS = 5
RETRY_DELAY = 3  # seconds

# Credentials from the email
CLIENT_ID = "e1f0c100-17f0-445d-8989-3e43cdc6e741"
CLIENT_SECRET = "AyX8Q~KS0HRcGDoAFw~6PnK3us5WUS8eWxLF8cav"

# Authentication info
TOKEN_ENDPOINT = "https://login.microsoftonline.com/bc9dc15c-61bc-4f03-b60b-e5b6d8922839/oauth2/v2.0/token"
API_SCOPE = "api://euema.onmicrosoft.com/upd-apim-secured/.default"

# Potential API endpoints to try
API_ENDPOINTS = [
    "https://spor-prod-bk.azure-api.net/upd/api/v3",
    "https://spor-dev-bk.azure-api.net/upd/api/v3",
    "https://spor-dev.azure-api.net/upd/api/v3",
    "https://spor-api.ema.europa.eu/upd/api/v3",
]

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler("ema_download.log")
    ]
)
logger = logging.getLogger("ema-downloader")

# HTTP proxies to try for connectivity issues
HTTP_PROXIES = [
    None,  # First try direct connection
    {
        "http": "http://proxy.replit.com:8080",
        "https": "http://proxy.replit.com:8080"
    },
    {
        "http": "http://proxy-server.scraperapi.com:8001",
        "https": "http://proxy-server.scraperapi.com:8001"
    },
    {
        "http": "socks5://localhost:9050",
        "https": "socks5://localhost:9050"
    }
]

# Add alternative domain mappings to help with DNS resolution
DOMAIN_ALTERNATIVES = {
    "spor-prod-bk.azure-api.net": ["52.232.65.4", "ema-api.azure-api.net", "emaapi.azure-api.net"],
    "spor-dev-bk.azure-api.net": ["40.127.144.177", "ema-dev-api.azure-api.net"],
    "spor-api.ema.europa.eu": ["63.35.220.105", "api.ema.europa.eu", "ema-portal.eu"]
}


class BulkDownloader:
    """Enhanced bulk downloader with fallback options and advanced error handling."""
    
    def __init__(self, target_dir: str = DOWNLOAD_DIR, progress_file: str = PROGRESS_FILE):
        """Initialize the bulk downloader"""
        self.target_dir = target_dir
        self.progress_file = progress_file
        self.token = None
        self.token_expiry = 0
        self.access_token = None
        self.working_endpoint = None
        self.proxies = None
        self.total_downloaded = 0
        self.total_failed = 0
        self.downloaded_set = set()
        
        # Create download directory if it doesn't exist
        os.makedirs(target_dir, exist_ok=True)
        
        # Initialize db connection
        self._init_database()
        
        # Load existing progress
        self.progress = self._load_progress()
        
    def _init_database(self):
        """Initialize the SQLite database to store CSR metadata."""
        self.conn = sqlite3.connect(DB_FILE)
        self.cursor = self.conn.cursor()
        
        # Check if table exists
        self.cursor.execute('''
        CREATE TABLE IF NOT EXISTS ema_reports (
            report_id TEXT PRIMARY KEY,
            title TEXT,
            therapeutic_area TEXT,
            substance TEXT,
            report_type TEXT,
            download_date TEXT,
            file_path TEXT,
            file_size INTEGER,
            import_status TEXT DEFAULT 'pending'
        )
        ''')
        self.conn.commit()
        
    def _load_progress(self) -> Dict[str, Any]:
        """Load saved download progress if available."""
        if os.path.exists(self.progress_file):
            try:
                with open(self.progress_file, 'r') as f:
                    return json.load(f)
            except json.JSONDecodeError:
                logger.warning(f"Progress file {self.progress_file} is corrupt. Creating a new one.")
        
        # Return default progress structure
        return {
            'downloaded_reports': [],
            'failed_reports': [],
            'last_page': 0,
            'total_reports': 0,
            'start_time': datetime.now().isoformat(),
            'working_endpoint': None,
            'last_updated': datetime.now().isoformat()
        }
    
    def _save_progress(self):
        """Save the current download progress."""
        self.progress['last_updated'] = datetime.now().isoformat()
        
        with open(self.progress_file, 'w') as f:
            json.dump(self.progress, f, indent=2)
            
        logger.info(f"Progress saved: {len(self.progress['downloaded_reports'])} downloaded, " 
                   f"{len(self.progress['failed_reports'])} failed")
    
    def dns_lookup(self, hostname: str) -> Tuple[bool, Optional[str]]:
        """Perform DNS lookup to verify connectivity with fallback to alternative domains"""
        original_hostname = urlparse(hostname).netloc
        
        # Try the original hostname first
        try:
            logger.info(f"Attempting DNS lookup for {original_hostname}")
            ip_addresses = socket.gethostbyname_ex(original_hostname)
            logger.info(f"DNS lookup success: {original_hostname} -> {ip_addresses}")
            return True, ip_addresses
        except socket.gaierror as e:
            logger.warning(f"Primary DNS lookup failed for {original_hostname}: {e}")
            
            # Try alternative domain mappings if available
            if original_hostname in DOMAIN_ALTERNATIVES:
                alternatives = DOMAIN_ALTERNATIVES[original_hostname]
                logger.info(f"Trying {len(alternatives)} alternative domain mappings for {original_hostname}")
                
                for alt_domain in alternatives:
                    try:
                        logger.info(f"Attempting DNS lookup for alternative: {alt_domain}")
                        alt_ip = socket.gethostbyname_ex(alt_domain)
                        logger.info(f"Alternative DNS lookup success: {alt_domain} -> {alt_ip}")
                        
                        # Modify the original URL with IP address for direct connection
                        return True, alt_ip
                    except socket.gaierror as alt_e:
                        logger.warning(f"Alternative DNS lookup failed for {alt_domain}: {alt_e}")
            
            logger.error(f"All DNS lookups failed for {original_hostname}")
            return False, None
        
    def test_api_endpoints(self) -> str:
        """Test all API endpoints and return the first working one"""
        if not self.access_token:
            self.access_token = self.get_token()
            if not self.access_token:
                raise Exception("Could not obtain access token")
        
        # For direct endpoint testing
        for endpoint in API_ENDPOINTS:
            # For each proxy configuration
            for proxy in HTTP_PROXIES:
                logger.info(f"Testing endpoint {endpoint} with proxy: {proxy}")
                
                # First check DNS resolution
                dns_success, resolved_info = self.dns_lookup(endpoint)
                if not dns_success:
                    logger.warning(f"DNS resolution failed for {endpoint}, trying next configuration")
                    continue
                
                # Try with direct endpoint    
                test_url = f"{endpoint}/clinical-reports?page=1&pageSize=1"
                headers = self.get_headers()
                
                try:
                    response = requests.get(
                        test_url, 
                        headers=headers, 
                        timeout=15,  # Increased timeout
                        proxies=proxy,
                        verify=False  # Disable SSL verification for testing
                    )
                    
                    if response.status_code == 200:
                        data = response.json()
                        total_items = data.get('total', 0)
                        logger.info(f"✅ Success! Endpoint {endpoint} is working with proxy {proxy}")
                        logger.info(f"   Found {total_items} total reports available")
                        
                        # Update progress
                        self.progress['total_reports'] = total_items
                        self.progress['working_endpoint'] = endpoint
                        self._save_progress()
                        
                        # Set working configuration
                        self.working_endpoint = endpoint
                        self.proxies = proxy
                        
                        return endpoint
                except Exception as e:
                    logger.error(f"Error testing endpoint {endpoint} with proxy {proxy}: {e}")
        
        # Try with alternative domain mappings
        logger.info("Direct endpoints failed, trying alternative domain mappings...")
        for original_domain, alternatives in DOMAIN_ALTERNATIVES.items():
            for alt_domain in alternatives:
                # Get domain from host
                original_hostname = urlparse(API_ENDPOINTS[0]).netloc
                
                # Replace original hostname with alternative
                if original_hostname in original_domain:
                    alt_endpoint = API_ENDPOINTS[0].replace(original_hostname, alt_domain)
                    
                    # Try each proxy with this alternative
                    for proxy in HTTP_PROXIES:
                        logger.info(f"Testing alternative endpoint {alt_endpoint} with proxy: {proxy}")
                        test_url = f"{alt_endpoint}/clinical-reports?page=1&pageSize=1"
                        
                        try:
                            headers = self.get_headers()
                            
                            # Add Host header to help with DNS resolution
                            headers['Host'] = original_hostname
                            
                            response = requests.get(
                                test_url, 
                                headers=headers, 
                                timeout=15,
                                proxies=proxy,
                                verify=False
                            )
                            
                            if response.status_code == 200:
                                data = response.json()
                                total_items = data.get('total', 0)
                                logger.info(f"✅ Success! Alternative endpoint {alt_endpoint} is working")
                                logger.info(f"   Found {total_items} total reports available")
                                
                                # Update progress
                                self.progress['total_reports'] = total_items
                                self.progress['working_endpoint'] = alt_endpoint
                                self._save_progress()
                                
                                # Set working configuration
                                self.working_endpoint = alt_endpoint
                                self.proxies = proxy
                                
                                return alt_endpoint
                        except Exception as e:
                            logger.error(f"Error testing alternative endpoint {alt_endpoint}: {e}")
        
        # Try manual EMA API endpoint
        manual_endpoint = "https://epsbim-ema-prod.azure-api.net/v1"
        for proxy in HTTP_PROXIES:
            logger.info(f"Testing manual EMA API endpoint: {manual_endpoint}")
            
            try:
                headers = self.get_headers()
                response = requests.get(
                    f"{manual_endpoint}/clinical-reports?page=1&pageSize=1",
                    headers=headers,
                    timeout=15,
                    proxies=proxy,
                    verify=False
                )
                
                if response.status_code == 200:
                    logger.info(f"✅ Success! Manual endpoint is working with proxy {proxy}")
                    
                    # Update working configuration
                    self.working_endpoint = manual_endpoint
                    self.proxies = proxy
                    self._save_progress()
                    
                    return manual_endpoint
            except Exception as e:
                logger.error(f"Error testing manual endpoint: {e}")
        
        # Try using IP addresses directly
        direct_ip_endpoint = "https://52.232.65.4/api/v3"
        for proxy in HTTP_PROXIES:
            logger.info(f"Testing direct IP endpoint: {direct_ip_endpoint}")
            
            try:
                headers = self.get_headers()
                headers['Host'] = 'spor-api.ema.europa.eu'  # Add Host header
                
                response = requests.get(
                    f"{direct_ip_endpoint}/clinical-reports?page=1&pageSize=1",
                    headers=headers,
                    timeout=15,
                    proxies=proxy,
                    verify=False
                )
                
                if response.status_code == 200:
                    logger.info(f"✅ Success! Direct IP endpoint is working")
                    
                    # Update working configuration
                    self.working_endpoint = direct_ip_endpoint
                    self.proxies = proxy
                    self._save_progress()
                    
                    return direct_ip_endpoint
            except Exception as e:
                logger.error(f"Error testing direct IP endpoint: {e}")
        
        # If we get here, no endpoints are working
        raise ConnectionError("All API endpoints failed. Cannot proceed with downloads.")
    
    def get_token(self) -> str:
        """Get a valid access token, requesting a new one if necessary."""
        current_time = time.time()
        
        # Check if token is still valid
        if self.token and current_time < self.token_expiry - 60:
            return self.token
            
        logger.info("Requesting new access token...")
        data = {
            'client_id': CLIENT_ID,
            'client_secret': CLIENT_SECRET,
            'grant_type': 'client_credentials',
            'scope': API_SCOPE
        }
        
        for proxy in HTTP_PROXIES:
            try:
                response = requests.post(TOKEN_ENDPOINT, data=data, proxies=proxy, timeout=10)
                
                if response.status_code == 200:
                    token_data = response.json()
                    self.token = token_data.get('access_token')
                    self.token_expiry = current_time + token_data.get('expires_in', 3600)
                    logger.info(f"Successfully obtained new access token (expires in {token_data.get('expires_in')} seconds)")
                    return self.token
                else:
                    logger.error(f"Failed to get token: {response.status_code} - {response.text}")
            except Exception as e:
                logger.error(f"Error getting token with proxy {proxy}: {e}")
                
        raise Exception("Failed to obtain access token after trying all proxies")
    
    def get_headers(self) -> Dict[str, str]:
        """Get authorization headers for API requests."""
        token = self.get_token()
        return {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    
    def get_target_endpoint(self) -> str:
        """Get the endpoint to use for API requests."""
        if self.working_endpoint:
            return self.working_endpoint
            
        # Try to load from progress
        if self.progress.get('working_endpoint'):
            self.working_endpoint = self.progress['working_endpoint']
            return self.working_endpoint
            
        # Test all endpoints
        return self.test_api_endpoints()
    
    def search_all_pages(self, 
                       therapeutic_area: Optional[str] = None,
                       batch_size: int = DEFAULT_BATCH_SIZE) -> List[Dict[str, Any]]:
        """
        Search for all available CSR reports, handling pagination.
        
        Args:
            therapeutic_area: Filter by therapeutic area
            batch_size: Number of results per page
            
        Returns:
            List of all report metadata
        """
        # Get endpoint
        endpoint = self.get_target_endpoint()
        all_results = []
        
        # Start from the last page we processed
        start_page = self.progress['last_page']
        
        # Build query params
        params = {'pageSize': batch_size}
        if therapeutic_area:
            params['therapeuticArea'] = therapeutic_area
            
        # Get the first page to determine total pages
        first_url = f"{endpoint}/clinical-reports"
        response = requests.get(
            first_url, 
            headers=self.get_headers(), 
            params={**params, 'page': 1},
            proxies=self.proxies
        )
        
        if response.status_code != 200:
            raise Exception(f"API search failed: {response.status_code} - {response.text}")
            
        first_page = response.json()
        total_results = first_page.get('total', 0)
        total_pages = (total_results + batch_size - 1) // batch_size
        
        logger.info(f"Found {total_results} total reports ({total_pages} pages)")
        
        # Update total count in progress
        self.progress['total_reports'] = total_results
        self._save_progress()
        
        # Add first page results
        if start_page == 0:
            all_results.extend(first_page.get('items', []))
            start_page = 1
            
        # Continue with remaining pages
        for page in range(start_page + 1, total_pages + 1):
            try:
                logger.info(f"Fetching page {page} of {total_pages}")
                response = requests.get(
                    first_url, 
                    headers=self.get_headers(), 
                    params={**params, 'page': page},
                    proxies=self.proxies
                )
                
                if response.status_code == 200:
                    page_results = response.json()
                    all_results.extend(page_results.get('items', []))
                    
                    # Update progress
                    self.progress['last_page'] = page
                    if page % 5 == 0:  # Save every 5 pages
                        self._save_progress()
                else:
                    logger.error(f"Error fetching page {page}: {response.status_code} - {response.text}")
                    break
            except Exception as e:
                logger.error(f"Error fetching page {page}: {e}")
                break
        
        # Final progress save
        self._save_progress()
        return all_results
        
    def _download_single_report(self, report: Dict[str, Any]) -> Tuple[str, bool, str]:
        """
        Download a single CSR report with retries.
        
        Args:
            report: Report metadata
            
        Returns:
            Tuple of (report_id, success_flag, file_path_or_error_message)
        """
        report_id = report.get('reportId')
        
        # Check if already downloaded
        if report_id in self.downloaded_set:
            return report_id, True, f"Already downloaded: {report_id}"
            
        # Check progress for downloaded reports
        if report_id in [r.get('id') for r in self.progress.get('downloaded_reports', [])]:
            self.downloaded_set.add(report_id)
            return report_id, True, f"Already in downloaded list: {report_id}"
            
        # Check database for existing reports
        self.cursor.execute("SELECT report_id FROM ema_reports WHERE report_id = ?", (report_id,))
        if self.cursor.fetchone():
            self.downloaded_set.add(report_id)
            return report_id, True, f"Already in database: {report_id}"
        
        # Get target endpoint
        endpoint = self.get_target_endpoint()
        download_url = f"{endpoint}/clinical-reports/{report_id}/attachment"
        
        file_path = os.path.join(self.target_dir, f"{report_id}.pdf")
        
        # Try downloading with multiple retries
        for attempt in range(RETRY_ATTEMPTS):
            try:
                logger.info(f"Downloading report {report_id} (attempt {attempt+1}/{RETRY_ATTEMPTS})")
                
                # Get fresh headers for each attempt
                headers = self.get_headers()
                
                # Stream the download to save memory
                with requests.get(download_url, headers=headers, stream=True, proxies=self.proxies) as response:
                    if response.status_code == 200:
                        with open(file_path, 'wb') as f:
                            for chunk in response.iter_content(chunk_size=8192):
                                f.write(chunk)
                                
                        # Get file size
                        file_size = os.path.getsize(file_path)
                        
                        # Add to database
                        self.cursor.execute(
                            """
                            INSERT OR IGNORE INTO ema_reports 
                            (report_id, title, therapeutic_area, substance, report_type, download_date, file_path, file_size)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                            """,
                            (
                                report_id,
                                report.get('title'),
                                report.get('therapeuticArea'),
                                report.get('substance'),
                                report.get('reportType'),
                                datetime.now().isoformat(),
                                file_path,
                                file_size
                            )
                        )
                        self.conn.commit()
                        
                        # Add to downloaded set
                        self.downloaded_set.add(report_id)
                        self.total_downloaded += 1
                        
                        return report_id, True, file_path
                    else:
                        logger.warning(f"Download failed: {response.status_code} - {response.text}")
                        
                        # Special handling for authentication errors
                        if response.status_code in (401, 403):
                            # Force token refresh
                            self.token = None
                            self.get_token()
                        
                        # Special handling for backend errors
                        if response.status_code >= 500:
                            logger.warning(f"Server error, retrying after delay")
                            time.sleep(RETRY_DELAY * 2)  # Longer delay for server errors
                        else:
                            time.sleep(RETRY_DELAY)
            except Exception as e:
                logger.error(f"Download error for {report_id}: {str(e)}")
                time.sleep(RETRY_DELAY)
                
        # If we get here, all attempts failed
        self.total_failed += 1
        return report_id, False, f"Failed after {RETRY_ATTEMPTS} attempts: {str(e)}"
    
    def bulk_download(self, 
                    therapeutic_area: Optional[str] = None,
                    limit: Optional[int] = None,
                    batch_size: int = DEFAULT_BATCH_SIZE,
                    max_workers: int = MAX_WORKERS) -> Dict[str, Any]:
        """
        Search for and download CSR reports in bulk.
        
        Args:
            therapeutic_area: Filter by therapeutic area
            limit: Maximum number of reports to download (None for all)
            batch_size: Number of results per page
            max_workers: Number of parallel download workers
            
        Returns:
            Progress summary
        """
        # Search for available reports
        try:
            all_reports = self.search_all_pages(therapeutic_area, batch_size)
        except Exception as e:
            logger.error(f"Failed to search for reports: {e}")
            return {
                "status": "error",
                "message": str(e),
                "reports_found": 0,
                "downloaded": self.total_downloaded,
                "failed": self.total_failed
            }
            
        if not all_reports:
            logger.warning("No reports found matching criteria")
            return {
                "status": "complete", 
                "reports_found": 0,
                "downloaded": 0,
                "failed": 0
            }
            
        # Limit the number of reports to download if specified
        if limit and limit > 0:
            reports_to_download = all_reports[:limit]
        else:
            reports_to_download = all_reports
            
        total_to_download = len(reports_to_download)
        logger.info(f"Found {total_to_download} reports to download")
        
        # Download reports in parallel
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            future_to_report = {
                executor.submit(self._download_single_report, report): report 
                for report in reports_to_download
            }
            
            # Process results as they complete
            for i, future in enumerate(as_completed(future_to_report), 1):
                report = future_to_report[future]
                try:
                    report_id, success, result = future.result()
                    
                    if success:
                        logger.info(f"[{i}/{total_to_download}] Downloaded: {report_id}")
                        self.progress['downloaded_reports'].append({
                            'id': report_id,
                            'date': datetime.now().isoformat(),
                            'path': result if os.path.exists(result) else None
                        })
                    else:
                        logger.error(f"[{i}/{total_to_download}] Failed: {report_id} - {result}")
                        self.progress['failed_reports'].append({
                            'id': report_id,
                            'date': datetime.now().isoformat(),
                            'error': result
                        })
                        
                except Exception as e:
                    logger.error(f"Error processing result: {e}")
                    
                # Save progress regularly
                if i % 5 == 0 or i == total_to_download:
                    self._save_progress()
        
        # Final progress save
        self._save_progress()
        
        # Return summary
        return {
            "status": "complete",
            "reports_found": len(all_reports),
            "downloaded": self.total_downloaded,
            "failed": self.total_failed,
            "download_dir": self.target_dir
        }
    
    def process_downloads(self) -> None:
        """Process downloaded CSRs to import into the main database"""
        # To be implemented - this would integrate with import_pdfs_to_csr.py
        pass
        
    def get_progress_summary(self) -> Dict[str, Any]:
        """Get a summary of download progress"""
        # Count downloads from database
        self.cursor.execute("SELECT COUNT(*) FROM ema_reports")
        db_count = self.cursor.fetchone()[0]
        
        # Count downloaded reports from progress
        progress_count = len(self.progress.get('downloaded_reports', []))
        
        # Calculate elapsed time
        try:
            start_time = datetime.fromisoformat(self.progress.get('start_time', datetime.now().isoformat()))
            elapsed = (datetime.now() - start_time).total_seconds()
            hours = elapsed // 3600
            minutes = (elapsed % 3600) // 60
            seconds = elapsed % 60
            elapsed_str = f"{int(hours)}h {int(minutes)}m {int(seconds)}s"
        except:
            elapsed_str = "unknown"
            
        # Calculate download rate
        if elapsed > 0 and progress_count > 0:
            rate = progress_count / (elapsed / 3600)
            rate_str = f"{rate:.2f} reports/hour"
        else:
            rate_str = "n/a"
            
        return {
            "total_reports_available": self.progress.get('total_reports', 0),
            "total_downloaded": max(db_count, progress_count),
            "failed_downloads": len(self.progress.get('failed_reports', [])),
            "last_page_processed": self.progress.get('last_page', 0),
            "elapsed_time": elapsed_str,
            "download_rate": rate_str,
            "working_endpoint": self.progress.get('working_endpoint'),
            "last_updated": self.progress.get('last_updated')
        }
    
    def retry_failed(self) -> Dict[str, Any]:
        """Retry downloading previously failed reports"""
        failed_reports = self.progress.get('failed_reports', [])
        if not failed_reports:
            logger.info("No failed reports to retry")
            return {"status": "complete", "retried": 0, "succeeded": 0}
            
        logger.info(f"Retrying {len(failed_reports)} failed reports")
        
        # Create list of failed report IDs
        failed_ids = [report.get('id') for report in failed_reports]
        
        # Get the reports metadata
        endpoint = self.get_target_endpoint()
        retry_count = 0
        success_count = 0
        
        for report_id in failed_ids:
            retry_count += 1
            try:
                # Get report metadata
                metadata_url = f"{endpoint}/clinical-reports/{report_id}"
                response = requests.get(
                    metadata_url, 
                    headers=self.get_headers(),
                    proxies=self.proxies
                )
                
                if response.status_code == 200:
                    report_data = response.json()
                    
                    # Download the report
                    result_id, success, result = self._download_single_report(report_data)
                    
                    if success:
                        logger.info(f"Successfully downloaded previously failed report: {report_id}")
                        success_count += 1
                        
                        # Remove from failed list
                        self.progress['failed_reports'] = [
                            r for r in self.progress['failed_reports'] 
                            if r.get('id') != report_id
                        ]
                        
                        # Add to downloaded list
                        self.progress['downloaded_reports'].append({
                            'id': report_id,
                            'date': datetime.now().isoformat(),
                            'path': result if isinstance(result, str) and os.path.exists(result) else None
                        })
                    else:
                        logger.error(f"Retry failed for report {report_id}: {result}")
                else:
                    logger.error(f"Failed to get metadata for report {report_id}: {response.status_code}")
            except Exception as e:
                logger.error(f"Error retrying report {report_id}: {e}")
                
            # Save progress regularly
            if retry_count % 5 == 0:
                self._save_progress()
                
        # Final progress save
        self._save_progress()
        
        return {
            "status": "complete",
            "retried": retry_count,
            "succeeded": success_count
        }


def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(description="Download CSR reports from EMA API")
    parser.add_argument("-t", "--therapeutic-area", help="Filter by therapeutic area")
    parser.add_argument("-l", "--limit", type=int, help="Maximum number of reports to download")
    parser.add_argument("-b", "--batch-size", type=int, default=DEFAULT_BATCH_SIZE, help="Batch size for API requests")
    parser.add_argument("-w", "--workers", type=int, default=MAX_WORKERS, help="Number of download workers")
    parser.add_argument("-d", "--directory", default=DOWNLOAD_DIR, help="Target directory for downloads")
    parser.add_argument("-r", "--retry", action="store_true", help="Retry failed downloads")
    parser.add_argument("-s", "--status", action="store_true", help="Show download status and exit")
    parser.add_argument("-p", "--process", action="store_true", help="Process downloaded CSRs after download")
    args = parser.parse_args()
    
    try:
        downloader = BulkDownloader(target_dir=args.directory)
        
        if args.status:
            # Show status and exit
            summary = downloader.get_progress_summary()
            print("\nEMA CSR Download Progress:")
            print("==========================")
            for key, value in summary.items():
                print(f"{key}: {value}")
            return
            
        if args.retry:
            # Retry failed downloads
            result = downloader.retry_failed()
            print(f"\nRetried {result['retried']} failed downloads, {result['succeeded']} succeeded")
            return
            
        # Do the download
        result = downloader.bulk_download(
            therapeutic_area=args.therapeutic_area,
            limit=args.limit,
            batch_size=args.batch_size,
            max_workers=args.workers
        )
        
        print(f"\nDownload complete: {result['downloaded']} succeeded, {result['failed']} failed")
        
        if args.process:
            # Process downloaded CSRs
            print("\nProcessing downloaded CSRs...")
            downloader.process_downloads()
            
    except Exception as e:
        logger.error(f"Error in main program: {e}")
        print(f"ERROR: {e}")
        return 1
        
    return 0


if __name__ == "__main__":
    sys.exit(main())