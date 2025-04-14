#!/usr/bin/env python3
"""
Bulk CSR Downloader for EMA API
-------------------------------
This script downloads Clinical Study Reports (CSRs) in bulk from the EMA API,
with support for pagination, retries, and resumption of interrupted downloads.
"""

import os
import sys
import json
import time
import logging
import requests
import sqlite3
import argparse
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime, timedelta
from concurrent.futures import ThreadPoolExecutor, as_completed

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('bulk_download.log')
    ]
)

logger = logging.getLogger("bulk-downloader")

# Constants
DOWNLOAD_DIR = "downloaded_csrs"
PROGRESS_FILE = "csr_download_progress.json"
DEFAULT_BATCH_SIZE = 50
MAX_WORKERS = 5
RETRY_ATTEMPTS = 3
RETRY_DELAY = 5  # seconds

# Authentication info
TOKEN_ENDPOINT = "https://login.microsoftonline.com/bc9dc15c-61bc-4f03-b60b-e5b6d8922839/oauth2/v2.0/token"
API_SCOPE = "api://euema.onmicrosoft.com/upd-apim-secured/.default"
# The API URL in the email mentions spor-dev-bk.azure-api.net but also shows a production URL format
# Let's try both formats
BASE_API_URL = "https://spor-dev-bk.azure-api.net/upd/api/v3"
CSR_DATABASE = "ema_csr_database.db"

# Always use hardcoded values from update_ema_credentials.py
CLIENT_ID = "e1f0c100-17f0-445d-8989-3e43cdc6e741"
CLIENT_SECRET = "AyX8Q~KS0HRcGDoAFw~6PnK3us5WUS8eWxLF8cav"

class BulkDownloader:
    """Handles bulk downloading of CSRs with progress tracking and resumption."""
    
    def __init__(self, target_dir: str = DOWNLOAD_DIR, progress_file: str = PROGRESS_FILE):
        self.target_dir = target_dir
        self.progress_file = progress_file
        self.access_token = None
        self.token_expires_at = None
        
        # Ensure download directory exists
        os.makedirs(target_dir, exist_ok=True)
        
        # Initialize database
        self._init_database()
        
        # Load previous progress if available
        self.progress = self._load_progress()
    
    def _init_database(self):
        """Initialize the SQLite database to store CSR metadata."""
        conn = sqlite3.connect(CSR_DATABASE)
        cursor = conn.cursor()
        
        # Create tables if they don't exist
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS csr_reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            report_id TEXT UNIQUE,
            title TEXT,
            procedure_number TEXT,
            scientific_name TEXT,
            therapeutic_area TEXT,
            publication_date TEXT,
            document_type TEXT,
            download_url TEXT,
            file_path TEXT,
            downloaded BOOLEAN DEFAULT 0,
            download_date TEXT,
            metadata TEXT,
            processed BOOLEAN DEFAULT 0,
            processed_date TEXT,
            extracted_text TEXT,
            embedding_id TEXT
        )
        ''')
        
        # Create indexes for faster queries
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_report_id ON csr_reports(report_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_therapeutic_area ON csr_reports(therapeutic_area)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_downloaded ON csr_reports(downloaded)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_processed ON csr_reports(processed)")
        
        conn.commit()
        conn.close()
        logger.info(f"Database initialized at {CSR_DATABASE}")
    
    def _load_progress(self) -> Dict[str, Any]:
        """Load saved download progress if available."""
        if os.path.exists(self.progress_file):
            try:
                with open(self.progress_file, 'r') as f:
                    progress = json.load(f)
                    logger.info(f"Loaded previous download progress: {len(progress.get('downloaded', [])) if progress else 0} reports already downloaded")
                    return progress
            except Exception as e:
                logger.warning(f"Error loading progress file: {str(e)}")
        
        # Return default empty progress
        return {
            "started_at": datetime.now().isoformat(),
            "last_updated": datetime.now().isoformat(),
            "total_found": 0,
            "downloaded": [],
            "failed": {},
            "current_page": 1,
            "therapeutic_area": None
        }
    
    def _save_progress(self):
        """Save the current download progress."""
        self.progress["last_updated"] = datetime.now().isoformat()
        
        try:
            with open(self.progress_file, 'w') as f:
                json.dump(self.progress, f, indent=2)
        except Exception as e:
            logger.error(f"Error saving progress: {str(e)}")
    
    def get_token(self) -> str:
        """Get a valid access token, requesting a new one if necessary."""
        # Check if we have a valid token
        if self.access_token and self.token_expires_at and datetime.now() < self.token_expires_at:
            return self.access_token
        
        # Otherwise, request a new token
        logger.info("Requesting new API access token")
        logger.info(f"Using CLIENT_ID: {CLIENT_ID}")
        logger.info(f"Using CLIENT_SECRET: {CLIENT_SECRET[:5]}...{CLIENT_SECRET[-5:] if CLIENT_SECRET else ''}")
        logger.info(f"Using TOKEN_ENDPOINT: {TOKEN_ENDPOINT}")
        logger.info(f"Using API_SCOPE: {API_SCOPE}")
        
        data = {
            'client_id': CLIENT_ID,
            'client_secret': CLIENT_SECRET,
            'grant_type': 'client_credentials',
            'scope': API_SCOPE
        }
        
        response = requests.post(TOKEN_ENDPOINT, data=data)
        
        if response.status_code != 200:
            error_msg = f"Token request failed: {response.status_code} - {response.text}"
            logger.error(error_msg)
            raise Exception(error_msg)
        
        token_data = response.json()
        self.access_token = token_data['access_token']
        
        # Set expiration time (subtract 5 minutes for safety margin)
        expires_in = int(token_data.get('expires_in', 3599))  # Default to ~1 hour if not provided
        self.token_expires_at = datetime.now() + timedelta(seconds=expires_in - 300)
        
        logger.info(f"New token obtained, expires at {self.token_expires_at}")
        return self.access_token
    
    def get_headers(self) -> Dict[str, str]:
        """Get authorization headers for API requests."""
        token = self.get_token()
        return {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    
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
        all_items = []
        page = self.progress.get("current_page", 1)
        total_items = 0
        
        logger.info(f"Starting search from page {page}")
        
        while True:
            try:
                # Build query parameters
                params = {
                    'page': page,
                    'pageSize': batch_size
                }
                
                if therapeutic_area:
                    params['therapeuticArea'] = therapeutic_area
                
                # Make the API request
                search_url = f"{BASE_API_URL}/clinical-reports"
                response = requests.get(search_url, headers=self.get_headers(), params=params)
                
                if response.status_code == 401:
                    # Token might be expired despite our safety margin
                    logger.warning("Unauthorized, refreshing token...")
                    self.access_token = None
                    self.token_expires_at = None
                    response = requests.get(search_url, headers=self.get_headers(), params=params)
                
                if response.status_code != 200:
                    logger.error(f"Search failed on page {page}: {response.status_code} - {response.text}")
                    break
                
                data = response.json()
                items = data.get('items', [])
                
                if not items:
                    logger.info(f"No more items found (page {page})")
                    break
                
                all_items.extend(items)
                total_items = data.get('total', len(all_items))
                
                logger.info(f"Found {len(items)} items on page {page} (total found: {len(all_items)}/{total_items})")
                
                # Update progress
                self.progress["current_page"] = page + 1
                self.progress["total_found"] = total_items
                self.progress["therapeutic_area"] = therapeutic_area
                self._save_progress()
                
                # Break if we've got all items or reached the end of results
                if len(all_items) >= total_items or len(items) < batch_size:
                    logger.info("Completed search of all pages")
                    break
                
                page += 1
                
                # Add a small delay to avoid overwhelming the API
                time.sleep(1)
                
            except Exception as e:
                logger.error(f"Error during search on page {page}: {str(e)}")
                break
        
        return all_items
    
    def _download_single_report(self, report: Dict[str, Any]) -> Tuple[str, bool, str]:
        """
        Download a single CSR report with retries.
        
        Args:
            report: Report metadata
            
        Returns:
            Tuple of (report_id, success_flag, file_path_or_error_message)
        """
        report_id = report.get('id')
        title = report.get('title', 'Untitled')
        
        if not report_id:
            return ("unknown", False, "Missing report ID")
        
        # Check if already downloaded
        conn = sqlite3.connect(CSR_DATABASE)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT file_path, downloaded FROM csr_reports WHERE report_id = ?", (report_id,))
        result = cursor.fetchone()
        
        if result and result['downloaded'] and os.path.exists(result['file_path']):
            conn.close()
            return (report_id, True, result['file_path'])
        
        # First get report details
        report_url = f"{BASE_API_URL}/clinical-reports/{report_id}"
        
        for attempt in range(RETRY_ATTEMPTS):
            try:
                # Get report details
                response = requests.get(report_url, headers=self.get_headers())
                
                if response.status_code == 401:
                    # Token might be expired, refresh it
                    self.access_token = None
                    self.token_expires_at = None
                    response = requests.get(report_url, headers=self.get_headers())
                
                if response.status_code != 200:
                    error_msg = f"Failed to get report details (attempt {attempt+1}/{RETRY_ATTEMPTS}): {response.status_code} - {response.text}"
                    logger.error(error_msg)
                    if attempt < RETRY_ATTEMPTS - 1:
                        time.sleep(RETRY_DELAY)
                        continue
                    else:
                        conn.close()
                        return (report_id, False, error_msg)
                
                # Extract download URL
                report_details = response.json()
                download_url = report_details.get('downloadUrl')
                
                if not download_url:
                    error_msg = f"No download URL found for report {report_id}"
                    logger.error(error_msg)
                    conn.close()
                    return (report_id, False, error_msg)
                
                # Create a safe filename
                file_name = f"{report_id}.pdf"  # Default name
                if 'title' in report_details:
                    # Create a safer filename from the title
                    safe_title = "".join([c if c.isalnum() or c in ' -_.' else '_' for c in report_details['title']])
                    file_name = f"{safe_title[:100]}_{report_id}.pdf"
                
                file_path = os.path.join(self.target_dir, file_name)
                
                # Download the file
                download_response = requests.get(download_url, headers=self.get_headers(), stream=True)
                
                if download_response.status_code != 200:
                    error_msg = f"Failed to download file (attempt {attempt+1}/{RETRY_ATTEMPTS}): {download_response.status_code} - {download_response.text}"
                    logger.error(error_msg)
                    if attempt < RETRY_ATTEMPTS - 1:
                        time.sleep(RETRY_DELAY)
                        continue
                    else:
                        conn.close()
                        return (report_id, False, error_msg)
                
                # If content-disposition header exists, use it to get filename
                if 'content-disposition' in download_response.headers:
                    content_disp = download_response.headers['content-disposition']
                    if 'filename=' in content_disp:
                        suggested_filename = content_disp.split('filename=')[1].strip('"\'')
                        if suggested_filename:
                            file_path = os.path.join(self.target_dir, suggested_filename)
                
                # Write the file
                with open(file_path, 'wb') as f:
                    for chunk in download_response.iter_content(chunk_size=8192):
                        f.write(chunk)
                
                # Update database
                cursor.execute(
                    """
                    INSERT OR REPLACE INTO csr_reports 
                    (report_id, title, procedure_number, scientific_name, therapeutic_area, 
                    publication_date, document_type, download_url, file_path, downloaded, download_date, metadata)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
                    """,
                    (
                        report_id,
                        report_details.get('title'),
                        report_details.get('procedureNumber'),
                        report_details.get('scientificName'),
                        report_details.get('therapeuticArea'),
                        report_details.get('publicationDate'),
                        report_details.get('documentType'),
                        download_url,
                        file_path,
                        datetime.now().isoformat(),
                        json.dumps(report_details)
                    )
                )
                conn.commit()
                
                logger.info(f"Successfully downloaded {report_id} to {file_path}")
                conn.close()
                return (report_id, True, file_path)
                
            except Exception as e:
                error_msg = f"Error downloading report {report_id} (attempt {attempt+1}/{RETRY_ATTEMPTS}): {str(e)}"
                logger.error(error_msg)
                if attempt < RETRY_ATTEMPTS - 1:
                    time.sleep(RETRY_DELAY)
                else:
                    conn.close()
                    return (report_id, False, error_msg)
        
        # This should never be reached due to returns in the loop
        conn.close()
        return (report_id, False, "Max retries reached")
    
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
            batch_size: Number of results per API search page
            max_workers: Maximum number of parallel downloads
            
        Returns:
            Dict with download statistics
        """
        # First perform search to get all matching reports
        all_reports = self.search_all_pages(therapeutic_area, batch_size)
        
        if not all_reports:
            logger.warning("No reports found matching criteria")
            return {
                "total_found": 0,
                "downloaded": 0,
                "failed": 0,
                "skipped": 0
            }
        
        # Filter out already downloaded reports
        already_downloaded = set(self.progress.get("downloaded", []))
        to_download = []
        
        for report in all_reports:
            report_id = report.get('id')
            if report_id and report_id not in already_downloaded:
                to_download.append(report)
        
        if limit is not None:
            to_download = to_download[:limit]
        
        logger.info(f"Found {len(all_reports)} total reports, {len(to_download)} to download")
        
        # Download reports in parallel
        successful = 0
        failed = 0
        skipped = len(all_reports) - len(to_download)
        
        if to_download:
            with ThreadPoolExecutor(max_workers=max_workers) as executor:
                futures = {executor.submit(self._download_single_report, report): report.get('id') for report in to_download}
                
                for future in as_completed(futures):
                    report_id = futures[future]
                    try:
                        result_id, success, file_path = future.result()
                        
                        if success:
                            self.progress["downloaded"].append(result_id)
                            successful += 1
                            
                            # Save progress periodically
                            if successful % 5 == 0:
                                self._save_progress()
                                
                        else:
                            self.progress["failed"][result_id] = file_path
                            failed += 1
                            
                    except Exception as e:
                        logger.error(f"Error processing future for report {report_id}: {str(e)}")
                        self.progress["failed"][report_id] = str(e)
                        failed += 1
        
        # Final save of progress
        self._save_progress()
        
        # Return statistics
        return {
            "total_found": len(all_reports),
            "downloaded": successful,
            "failed": failed,
            "skipped": skipped
        }
    
    def retry_failed(self, max_workers: int = MAX_WORKERS) -> Dict[str, Any]:
        """
        Retry downloading previously failed reports.
        
        Args:
            max_workers: Maximum number of parallel downloads
            
        Returns:
            Dict with retry statistics
        """
        failed_reports = self.progress.get("failed", {})
        
        if not failed_reports:
            logger.info("No failed reports to retry")
            return {
                "total_retry": 0,
                "successful": 0,
                "still_failed": 0
            }
        
        logger.info(f"Retrying {len(failed_reports)} failed reports")
        
        # Convert to list of tuples for easier handling
        reports_to_retry = [(report_id, error_msg) for report_id, error_msg in failed_reports.items()]
        
        # Retry in parallel
        successful = 0
        still_failed = 0
        
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            # For each failed report, we need to get its details first
            futures = {}
            
            for report_id, _ in reports_to_retry:
                # Create a minimal report dict with just the ID
                report = {'id': report_id}
                futures[executor.submit(self._download_single_report, report)] = report_id
            
            for future in as_completed(futures):
                report_id = futures[future]
                try:
                    result_id, success, file_path = future.result()
                    
                    if success:
                        # Remove from failed list
                        if report_id in self.progress["failed"]:
                            del self.progress["failed"][report_id]
                        
                        # Add to downloaded list
                        if report_id not in self.progress["downloaded"]:
                            self.progress["downloaded"].append(report_id)
                        
                        successful += 1
                        
                        # Save progress periodically
                        if successful % 5 == 0:
                            self._save_progress()
                    else:
                        # Update error message
                        self.progress["failed"][report_id] = file_path
                        still_failed += 1
                        
                except Exception as e:
                    logger.error(f"Error retrying report {report_id}: {str(e)}")
                    self.progress["failed"][report_id] = str(e)
                    still_failed += 1
        
        # Final save of progress
        self._save_progress()
        
        # Return statistics
        return {
            "total_retry": len(reports_to_retry),
            "successful": successful,
            "still_failed": still_failed
        }
    
    def get_download_stats(self) -> Dict[str, Any]:
        """Get statistics about downloaded reports."""
        conn = sqlite3.connect(CSR_DATABASE)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        stats = {
            "total_in_database": 0,
            "downloaded": 0,
            "not_downloaded": 0,
            "therapeutic_areas": {},
            "document_types": {},
            "by_year": {}
        }
        
        # Total reports
        cursor.execute("SELECT COUNT(*) as count FROM csr_reports")
        result = cursor.fetchone()
        stats["total_in_database"] = result['count'] if result else 0
        
        # Downloaded vs not downloaded
        cursor.execute("SELECT COUNT(*) as count FROM csr_reports WHERE downloaded = 1")
        result = cursor.fetchone()
        stats["downloaded"] = result['count'] if result else 0
        
        cursor.execute("SELECT COUNT(*) as count FROM csr_reports WHERE downloaded = 0")
        result = cursor.fetchone()
        stats["not_downloaded"] = result['count'] if result else 0
        
        # By therapeutic area
        cursor.execute("""
            SELECT therapeutic_area, COUNT(*) as count 
            FROM csr_reports 
            WHERE therapeutic_area IS NOT NULL
            GROUP BY therapeutic_area
            ORDER BY count DESC
        """)
        for row in cursor.fetchall():
            stats["therapeutic_areas"][row['therapeutic_area']] = row['count']
        
        # By document type
        cursor.execute("""
            SELECT document_type, COUNT(*) as count 
            FROM csr_reports 
            WHERE document_type IS NOT NULL
            GROUP BY document_type
            ORDER BY count DESC
        """)
        for row in cursor.fetchall():
            stats["document_types"][row['document_type']] = row['count']
        
        # By year (extract year from publication_date)
        cursor.execute("""
            SELECT substr(publication_date, 1, 4) as year, COUNT(*) as count 
            FROM csr_reports 
            WHERE publication_date IS NOT NULL
            GROUP BY year
            ORDER BY year DESC
        """)
        for row in cursor.fetchall():
            stats["by_year"][row['year']] = row['count']
        
        conn.close()
        return stats


def main():
    parser = argparse.ArgumentParser(description="Bulk download CSRs from EMA API")
    parser.add_argument("--target-dir", default=DOWNLOAD_DIR, help=f"Directory to save downloaded files (default: {DOWNLOAD_DIR})")
    parser.add_argument("--therapeutic-area", help="Filter by therapeutic area")
    parser.add_argument("--limit", type=int, help="Maximum number of reports to download (default: all)")
    parser.add_argument("--batch-size", type=int, default=DEFAULT_BATCH_SIZE, help=f"Number of results per API search page (default: {DEFAULT_BATCH_SIZE})")
    parser.add_argument("--workers", type=int, default=MAX_WORKERS, help=f"Maximum number of parallel downloads (default: {MAX_WORKERS})")
    parser.add_argument("--retry", action="store_true", help="Retry previously failed downloads")
    parser.add_argument("--stats", action="store_true", help="Show download statistics")
    parser.add_argument("--test-auth", action="store_true", help="Test authentication only")
    
    args = parser.parse_args()
    
    # Check if required environment variables are set
    if not CLIENT_ID or not CLIENT_SECRET:
        logger.error("EMA_CLIENT_ID and EMA_CLIENT_SECRET environment variables must be set")
        sys.exit(1)
    
    # Create downloader
    downloader = BulkDownloader(target_dir=args.target_dir)
    
    # Test authentication if requested
    if args.test_auth:
        try:
            token = downloader.get_token()
            token_preview = token[:15] + "..." if token else "None"
            logger.info(f"Authentication successful. Token: {token_preview}")
            return
        except Exception as e:
            logger.error(f"Authentication failed: {str(e)}")
            sys.exit(1)
    
    # Show stats if requested
    if args.stats:
        stats = downloader.get_download_stats()
        logger.info("CSR Download Statistics:")
        logger.info(f"Total reports in database: {stats['total_in_database']}")
        logger.info(f"Downloaded: {stats['downloaded']}")
        logger.info(f"Not downloaded: {stats['not_downloaded']}")
        
        logger.info("\nTop therapeutic areas:")
        for area, count in list(stats['therapeutic_areas'].items())[:5]:
            logger.info(f"  {area}: {count}")
        
        logger.info("\nDocument types:")
        for doc_type, count in stats['document_types'].items():
            logger.info(f"  {doc_type}: {count}")
        
        logger.info("\nReports by year:")
        for year, count in stats['by_year'].items():
            logger.info(f"  {year}: {count}")
        
        return
    
    # Retry failed downloads if requested
    if args.retry:
        logger.info("Retrying failed downloads...")
        stats = downloader.retry_failed(max_workers=args.workers)
        logger.info(f"Retry complete: {stats['successful']} successful, {stats['still_failed']} still failed (out of {stats['total_retry']} retried)")
        return
    
    # Otherwise, perform regular download
    logger.info(f"Starting bulk download (therapeutic area: {args.therapeutic_area or 'All'}, limit: {args.limit or 'All'})")
    stats = downloader.bulk_download(
        therapeutic_area=args.therapeutic_area,
        limit=args.limit,
        batch_size=args.batch_size,
        max_workers=args.workers
    )
    
    logger.info(f"Download complete: {stats['downloaded']} new downloads, {stats['failed']} failed, {stats['skipped']} skipped (total found: {stats['total_found']})")


if __name__ == "__main__":
    main()