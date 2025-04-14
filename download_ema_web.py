#!/usr/bin/env python3
"""
EMA Web Portal Downloader
------------------------
This script downloads Clinical Study Reports (CSRs) from the EMA Clinical Data portal
using web scraping instead of the API.

It handles:
1. Searching for CSRs on the EMA Clinical Data portal
2. Navigating to clinical details pages
3. Downloading CSR documents
4. Tracking download progress

Since this script doesn't rely on the EMA API, it should work even with DNS resolution issues.
"""

import os
import sys
import time
import argparse
import logging
import json
import random
import re
import sqlite3
from datetime import datetime
from typing import Dict, List, Any, Optional, Tuple
import requests
from bs4 import BeautifulSoup

# Constants
DOWNLOAD_DIR = "downloaded_csrs/ema_web"
DB_FILE = "ema_web_downloads.db"
PROGRESS_FILE = "ema_web_progress.json"
BASE_URL = "https://clinicaldata.ema.europa.eu"
SEARCH_URL = f"{BASE_URL}/web/cdp/search"
MAX_RETRY_ATTEMPTS = 5
RETRY_DELAY = 3  # seconds
LOG_FILE = "ema_web_downloader.log"

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(LOG_FILE)
    ]
)
logger = logging.getLogger("ema-web-downloader")

# User agents to rotate
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1"
]

# Search terms to use for finding CSRs
SEARCH_TERMS = [
    # Therapeutic areas and common drug classes
    "oncology", "cancer", "cardiology", "neurology", "immunology",
    "diabetes", "hypertension", "infectious", "rheumatoid", "arthritis", 
    "respiratory", "asthma", "dermatology", "gastroenterology", "psychiatry",
    "vaccine", "antibody", "antiviral", "antibiotics", "monoclonal",
    "ophthalmology", "covid", "hepatitis", "influenza", "hiv",
    
    # Study phases
    "phase 1", "phase 2", "phase 3", "phase 4", "phase i", "phase ii", "phase iii", "phase iv",
    
    # Study types
    "randomized", "double-blind", "open-label", "placebo-controlled",
    
    # Document types
    "clinical study report", "csr", "clinical trial",
    
    # Years (to get historical coverage)
    "2020", "2019", "2018", "2017", "2016", "2015"
]

class EmaWebDownloader:
    """Downloads CSRs from the EMA Clinical Data portal using web scraping"""
    
    def __init__(self, target_dir=DOWNLOAD_DIR):
        """Initialize the downloader"""
        self.target_dir = target_dir
        self.session = requests.Session()
        
        # Create download directory
        os.makedirs(target_dir, exist_ok=True)
        
        # Initialize database
        self._init_database()
        
        # Initialize session with headers
        self._update_session()
        
        # Stats
        self.total_downloaded = 0
        self.total_failed = 0
    
    def _update_session(self):
        """Update session with random user agent"""
        self.session.headers.update({
            'User-Agent': random.choice(USER_AGENTS),
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        })
    
    def _init_database(self):
        """Initialize the SQLite database to track downloaded CSRs"""
        self.conn = sqlite3.connect(DB_FILE)
        self.cursor = self.conn.cursor()
        
        # Create table if it doesn't exist
        self.cursor.execute('''
        CREATE TABLE IF NOT EXISTS ema_reports (
            report_id TEXT PRIMARY KEY,
            title TEXT,
            therapeutic_area TEXT,
            procedure_number TEXT,
            medicine_name TEXT,
            active_substance TEXT,
            details_url TEXT,
            download_url TEXT,
            download_date TEXT,
            file_path TEXT,
            file_size INTEGER,
            import_status TEXT DEFAULT 'pending'
        )
        ''')
        
        # Create index for therapeutic area
        self.cursor.execute('''
        CREATE INDEX IF NOT EXISTS idx_therapeutic_area ON ema_reports (therapeutic_area)
        ''')
        
        self.conn.commit()
    
    def search_reports(self, search_term="", page=0, size=100) -> Tuple[bool, List[Dict[str, Any]]]:
        """
        Search for CSR reports on the EMA Clinical Data portal
        
        Args:
            search_term: Optional search term
            page: Page number (0-based)
            size: Number of results per page
            
        Returns:
            Tuple of (success flag, list of report metadata)
        """
        # Build query parameters
        params = {
            'sort': 'desc,medicine_name',
            'page': page,
            'size': size
        }
        
        if search_term:
            params['q'] = search_term
        
        for attempt in range(MAX_RETRY_ATTEMPTS):
            try:
                # Update session for each attempt
                if attempt > 0:
                    self._update_session()
                
                logger.info(f"Searching EMA portal with term '{search_term}' (page {page}, size {size})")
                
                response = self.session.get(SEARCH_URL, params=params, timeout=15)
                
                if response.status_code == 200:
                    # Parse the search page to extract results
                    soup = BeautifulSoup(response.text, 'html.parser')
                    
                    # Check for search results
                    search_results = soup.select('.search-result-row')
                    
                    logger.info(f"Found {len(search_results)} search results on the page")
                    
                    # Extract information from search results
                    results = []
                    
                    for idx, result in enumerate(search_results):
                        try:
                            # Extract data
                            title_elem = result.select_one('.medicine-title')
                            title = title_elem.text.strip() if title_elem else "Unknown"
                            
                            proc_elem = result.select_one('.procedure-number')
                            procedure_number = proc_elem.text.strip() if proc_elem else "Unknown"
                            
                            substance_elem = result.select_one('.active-substance-value')
                            substance = substance_elem.text.strip() if substance_elem else "Unknown"
                            
                            area_elem = result.select_one('.therapeutic-area-value')
                            therapeutic_area = area_elem.text.strip() if area_elem else "Unknown"
                            
                            # Extract details link
                            details_url = None
                            links = result.select('a')
                            for link in links:
                                href = link.get('href', '')
                                if 'clinical-details' in href:
                                    details_url = f"{BASE_URL}{href}" if href.startswith('/') else href
                                    break
                            
                            # Create unique report ID
                            report_id = f"EMA_WEB_{procedure_number}_{idx}"
                            
                            results.append({
                                'report_id': report_id,
                                'title': title,
                                'procedure_number': procedure_number,
                                'active_substance': substance,
                                'therapeutic_area': therapeutic_area,
                                'details_url': details_url
                            })
                        except Exception as e:
                            logger.error(f"Error extracting data from result {idx+1}: {e}")
                    
                    return True, results
                else:
                    logger.error(f"Search failed with status code {response.status_code}")
                    time.sleep(RETRY_DELAY)
            except Exception as e:
                logger.error(f"Error searching EMA portal: {e}")
                time.sleep(RETRY_DELAY)
        
        return False, []
    
    def get_download_links(self, details_url: str) -> List[Dict[str, Any]]:
        """
        Extract CSR download links from a clinical details page
        
        Args:
            details_url: URL of the clinical details page
            
        Returns:
            List of document metadata with download links
        """
        documents = []
        
        for attempt in range(MAX_RETRY_ATTEMPTS):
            try:
                # Update session for each attempt
                if attempt > 0:
                    self._update_session()
                
                logger.info(f"Accessing clinical details page: {details_url}")
                
                response = self.session.get(details_url, timeout=15)
                
                if response.status_code == 200:
                    # Parse the details page
                    soup = BeautifulSoup(response.text, 'html.parser')
                    
                    # Extract medicine name
                    medicine_name = "Unknown"
                    title_elem = soup.select_one('h1.medicine-heading')
                    if title_elem:
                        medicine_name = title_elem.text.strip()
                    
                    # Look for clinical study report documents
                    doc_tables = soup.select('.clinical-data-table')
                    
                    if not doc_tables:
                        logger.warning("No document tables found on the details page")
                        return documents
                    
                    for table in doc_tables:
                        # Check table header
                        header = table.select_one('.clinical-data-table-header')
                        if header and ("clinical study report" in header.text.lower() or "csr" in header.text.lower()):
                            logger.info(f"Found clinical study report table: {header.text.strip()}")
                            
                            # Extract document links
                            doc_rows = table.select('.spcDocsList')
                            
                            for row in doc_rows:
                                try:
                                    # Extract document name
                                    name_elem = row.select_one('.spcDocsListItem')
                                    doc_name = name_elem.text.strip() if name_elem else "Unknown Document"
                                    
                                    # Extract download link
                                    links = row.select('a')
                                    download_url = None
                                    
                                    for link in links:
                                        href = link.get('href', '')
                                        if '/documents/' in href:
                                            download_url = f"{BASE_URL}{href}" if href.startswith('/') else href
                                            break
                                    
                                    if download_url:
                                        # Create a unique document ID
                                        doc_id = f"EMA_WEB_DOC_{hash(download_url) % 100000:05d}"
                                        
                                        documents.append({
                                            'doc_id': doc_id,
                                            'name': doc_name,
                                            'medicine_name': medicine_name,
                                            'download_url': download_url
                                        })
                                except Exception as e:
                                    logger.error(f"Error extracting document data: {e}")
                    
                    logger.info(f"Found {len(documents)} CSR documents on the details page")
                    return documents
                else:
                    logger.error(f"Failed to access details page: {response.status_code}")
                    time.sleep(RETRY_DELAY)
            except Exception as e:
                logger.error(f"Error accessing details page: {e}")
                time.sleep(RETRY_DELAY)
        
        return documents
    
    def download_csr_document(self, report_id: str, document_data: Dict[str, Any], report_data: Dict[str, Any]) -> Tuple[bool, str]:
        """
        Download a CSR document
        
        Args:
            report_id: Unique report ID
            document_data: Document metadata including download URL
            report_data: Report metadata
            
        Returns:
            Tuple of (success flag, file path or error message)
        """
        download_url = document_data.get('download_url')
        doc_name = document_data.get('name', 'Unknown')
        
        if not download_url:
            return False, "No download URL provided"
        
        # Check if already downloaded
        self.cursor.execute("SELECT file_path FROM ema_reports WHERE report_id = ?", (report_id,))
        existing = self.cursor.fetchone()
        
        if existing and existing[0] and os.path.exists(existing[0]):
            logger.info(f"Document {report_id} already downloaded")
            return True, existing[0]
        
        # Create a safe filename
        safe_id = re.sub(r'[^a-zA-Z0-9_-]', '_', report_id)
        filename = f"{safe_id}.pdf"
        file_path = os.path.join(self.target_dir, filename)
        
        for attempt in range(MAX_RETRY_ATTEMPTS):
            try:
                # Update session for each attempt
                if attempt > 0:
                    self._update_session()
                
                logger.info(f"Downloading document {report_id} from {download_url}")
                
                response = self.session.get(download_url, stream=True, timeout=60)
                
                if response.status_code == 200:
                    # Check if it's a PDF
                    content_type = response.headers.get('Content-Type', '')
                    if 'application/pdf' not in content_type and 'application/octet-stream' not in content_type:
                        logger.warning(f"Downloaded file may not be a PDF: {content_type}")
                    
                    # Save the file
                    with open(file_path, 'wb') as f:
                        for chunk in response.iter_content(chunk_size=8192):
                            f.write(chunk)
                    
                    # Get file size
                    file_size = os.path.getsize(file_path)
                    
                    # Verify file size
                    if file_size < 1000:  # Less than 1KB is probably not a valid PDF
                        logger.warning(f"Downloaded file is too small ({file_size} bytes), might not be valid")
                        os.remove(file_path)
                        time.sleep(RETRY_DELAY)
                        continue
                    
                    # Add to database
                    therapeutic_area = report_data.get('therapeutic_area', 'Unknown')
                    procedure_number = report_data.get('procedure_number', 'Unknown')
                    medicine_name = report_data.get('medicine_name', document_data.get('medicine_name', 'Unknown'))
                    active_substance = report_data.get('active_substance', 'Unknown')
                    details_url = report_data.get('details_url', '')
                    title = doc_name
                    
                    self.cursor.execute('''
                    INSERT OR REPLACE INTO ema_reports
                    (report_id, title, therapeutic_area, procedure_number, medicine_name, 
                    active_substance, details_url, download_url, download_date, file_path, 
                    file_size, import_status)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ''', (
                        report_id,
                        title,
                        therapeutic_area,
                        procedure_number,
                        medicine_name,
                        active_substance,
                        details_url,
                        download_url,
                        datetime.now().isoformat(),
                        file_path,
                        file_size,
                        'pending'
                    ))
                    self.conn.commit()
                    
                    # Update stats
                    self.total_downloaded += 1
                    
                    logger.info(f"Successfully downloaded document {report_id} to {file_path}")
                    return True, file_path
                else:
                    logger.error(f"Download failed: {response.status_code}")
                    time.sleep(RETRY_DELAY)
            except Exception as e:
                logger.error(f"Error downloading document: {e}")
                time.sleep(RETRY_DELAY)
        
        # If all attempts failed
        self.total_failed += 1
        error_message = f"Failed to download after {MAX_RETRY_ATTEMPTS} attempts"
        
        return False, error_message
    
    def search_and_download_all(self, limit: Optional[int] = None, search_term: str = "") -> Dict[str, Any]:
        """
        Search for CSR reports and download them
        
        Args:
            limit: Maximum number of CSRs to download (None for no limit)
            search_term: Optional search term to filter results
            
        Returns:
            Summary of the download process
        """
        # If no specific search term is provided, use our predefined search terms
        search_terms = [search_term] if search_term else SEARCH_TERMS
        
        total_downloaded = 0
        total_failed = 0
        
        for term in search_terms:
            # Check if we've reached the download limit
            if limit and total_downloaded >= limit:
                logger.info(f"Reached download limit of {limit} CSRs")
                break
            
            page = 0
            page_size = 20
            more_results = True
            
            while more_results:
                # Check if we've reached the download limit
                if limit and total_downloaded >= limit:
                    break
                
                # Search for reports
                success, reports = self.search_reports(search_term=term, page=page, size=page_size)
                
                if not success or not reports:
                    logger.info(f"No more results for search term '{term}'")
                    more_results = False
                    continue
                
                # Process each report
                for report in reports:
                    # Check if we've reached the download limit
                    if limit and total_downloaded >= limit:
                        break
                    
                    # Check if we already have this report
                    report_id = report.get('report_id')
                    
                    self.cursor.execute("SELECT file_path FROM ema_reports WHERE report_id = ?", (report_id,))
                    existing = self.cursor.fetchone()
                    
                    if existing and existing[0] and os.path.exists(existing[0]):
                        logger.info(f"Report {report_id} already downloaded")
                        total_downloaded += 1
                        continue
                    
                    # Get details URL
                    details_url = report.get('details_url')
                    
                    if not details_url:
                        logger.warning(f"No details URL found for report {report_id}")
                        continue
                    
                    # Get download links from details page
                    documents = self.get_download_links(details_url)
                    
                    if not documents:
                        logger.warning(f"No CSR documents found for report {report_id}")
                        continue
                    
                    # Download each document
                    doc_success = False
                    
                    for document in documents:
                        # Generate a unique report ID for each document
                        doc_report_id = f"{report_id}_{document.get('doc_id', 'doc')}"
                        
                        success, _ = self.download_csr_document(
                            report_id=doc_report_id,
                            document_data=document,
                            report_data=report
                        )
                        
                        if success:
                            doc_success = True
                            total_downloaded += 1
                            
                            # Check if we've reached the download limit
                            if limit and total_downloaded >= limit:
                                break
                    
                    if not doc_success:
                        total_failed += 1
                
                # Move to next page
                page += 1
                
                # Limit to 5 pages per search term to avoid overloading
                if page >= 5:
                    more_results = False
        
        return {
            "status": "complete",
            "downloaded": total_downloaded,
            "failed": total_failed,
            "search_terms_used": len(search_terms)
        }
    
    def get_status(self) -> Dict[str, Any]:
        """Get current status"""
        # Count documents from database
        self.cursor.execute("SELECT COUNT(*) FROM ema_reports")
        db_count = self.cursor.fetchone()[0]
        
        # Count by import status
        self.cursor.execute("SELECT COUNT(*) FROM ema_reports WHERE import_status = 'pending'")
        pending_count = self.cursor.fetchone()[0]
        
        self.cursor.execute("SELECT COUNT(*) FROM ema_reports WHERE import_status = 'imported'")
        imported_count = self.cursor.fetchone()[0]
        
        self.cursor.execute("SELECT COUNT(*) FROM ema_reports WHERE import_status = 'failed'")
        failed_count = self.cursor.fetchone()[0]
        
        # Count by therapeutic area
        self.cursor.execute('''
        SELECT therapeutic_area, COUNT(*) 
        FROM ema_reports 
        GROUP BY therapeutic_area 
        ORDER BY COUNT(*) DESC
        ''')
        area_counts = self.cursor.fetchall()
        
        return {
            "total_documents": db_count,
            "pending_import": pending_count,
            "imported": imported_count,
            "failed_import": failed_count,
            "therapeutic_areas": dict(area_counts)
        }

def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(description="Download CSRs from the EMA Clinical Data portal")
    parser.add_argument("-l", "--limit", type=int, help="Maximum number of CSRs to download")
    parser.add_argument("-s", "--search", default="", help="Search term to filter results")
    parser.add_argument("-o", "--output-dir", default=DOWNLOAD_DIR, help="Directory to save CSRs")
    parser.add_argument("--status", action="store_true", help="Show current status and exit")
    args = parser.parse_args()
    
    downloader = EmaWebDownloader(target_dir=args.output_dir)
    
    if args.status:
        status = downloader.get_status()
        print("\nEMA Web Downloader Status:")
        print("========================")
        print(f"Total documents: {status['total_documents']}")
        print(f"Pending import: {status['pending_import']}")
        print(f"Imported: {status['imported']}")
        print(f"Failed import: {status['failed_import']}")
        
        if status['therapeutic_areas']:
            print("\nTherapeutic areas:")
            for area, count in status['therapeutic_areas'].items():
                print(f"  {area}: {count}")
        
        return 0
    
    result = downloader.search_and_download_all(
        limit=args.limit,
        search_term=args.search
    )
    
    print("\nDownload Summary:")
    print("================")
    for key, value in result.items():
        print(f"{key}: {value}")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())