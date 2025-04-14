#!/usr/bin/env python3
"""
FDA CSR Downloader
----------------
This script downloads Clinical Study Reports (CSRs) from the FDA and
stores them locally for processing. It uses the FDA's Drugs@FDA API
to search for drug approvals and then scrapes the FDA website to find
associated CSRs.
"""

import os
import sys
import time
import argparse
import logging
import json
import re
import sqlite3
import random
from datetime import datetime
from typing import Dict, List, Any, Optional, Tuple
import requests
from urllib.parse import urljoin

# Constants
DOWNLOAD_DIR = "downloaded_csrs/fda"
DB_FILE = "fda_downloads.db"
PROGRESS_FILE = "fda_download_progress.json"
FDA_API_BASE = "https://api.fda.gov/drug/"
FDA_WEB_BASE = "https://www.accessdata.fda.gov/drugsatfda_docs/"
MAX_RETRY_ATTEMPTS = 5
RETRY_DELAY = 3  # seconds
LOG_FILE = "fda_csr_downloader.log"

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(LOG_FILE)
    ]
)
logger = logging.getLogger("fda-csr-downloader")

# User agents to rotate
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1"
]

class FdaCsrDownloader:
    """Downloads CSRs from the FDA"""
    
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
        
        # Load or create progress data
        self.progress_data = self._load_progress()
        
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
        CREATE TABLE IF NOT EXISTS fda_reports (
            application_number TEXT PRIMARY KEY,
            drug_name TEXT,
            manufacturer TEXT,
            approval_date TEXT,
            therapeutic_area TEXT,
            approval_type TEXT,
            links TEXT,
            search_term TEXT,
            submission_status TEXT,
            review_priority TEXT,
            review_documents TEXT,
            csr_links TEXT,
            download_status TEXT DEFAULT 'pending',
            download_date TEXT,
            file_path TEXT,
            file_size INTEGER,
            import_status TEXT DEFAULT 'pending',
            notes TEXT
        )
        ''')
        
        # Create indices
        self.cursor.execute('''
        CREATE INDEX IF NOT EXISTS idx_drug_name ON fda_reports (drug_name)
        ''')
        self.cursor.execute('''
        CREATE INDEX IF NOT EXISTS idx_download_status ON fda_reports (download_status)
        ''')
        
        self.conn.commit()
    
    def _load_progress(self) -> Dict[str, Any]:
        """Load saved download progress if available"""
        if os.path.exists(PROGRESS_FILE):
            try:
                with open(PROGRESS_FILE, 'r') as f:
                    return json.load(f)
            except Exception as e:
                logger.error(f"Error loading progress file: {e}")
        
        # Default progress data
        return {
            "last_updated": datetime.now().isoformat(),
            "search_terms_processed": [],
            "applications_processed": 0,
            "downloaded": 0,
            "failed": 0,
            "last_search_term": None,
            "last_search_skip": 0
        }
    
    def _save_progress(self):
        """Save the current download progress"""
        self.progress_data["last_updated"] = datetime.now().isoformat()
        self.progress_data["downloaded"] = self.total_downloaded
        self.progress_data["failed"] = self.total_failed
        
        try:
            with open(PROGRESS_FILE, 'w') as f:
                json.dump(self.progress_data, f, indent=2)
        except Exception as e:
            logger.error(f"Error saving progress file: {e}")
    
    def search_drug_approvals(self, 
                            search_term: str = "", 
                            limit: int = 100, 
                            skip: int = 0) -> Tuple[bool, List[Dict[str, Any]]]:
        """
        Search for drug approvals via the FDA API
        
        Args:
            search_term: Optional search term
            limit: Maximum number of results to return
            skip: Number of results to skip
            
        Returns:
            Tuple of (success flag, list of drug approval metadata)
        """
        endpoint = "approval.json"
        params = {
            "limit": limit,
            "skip": skip
        }
        
        if search_term:
            params["search"] = search_term
        
        for attempt in range(MAX_RETRY_ATTEMPTS):
            try:
                # Update session for each attempt
                if attempt > 0:
                    self._update_session()
                
                logger.info(f"Searching FDA drug approvals with term '{search_term}' (limit {limit}, skip {skip})")
                
                url = urljoin(FDA_API_BASE, endpoint)
                response = self.session.get(url, params=params, timeout=15)
                
                if response.status_code == 200:
                    data = response.json()
                    results = data.get("results", [])
                    total = data.get("meta", {}).get("results", {}).get("total", 0)
                    
                    logger.info(f"Found {len(results)} results (total available: {total})")
                    
                    return True, results
                else:
                    logger.error(f"Search failed with status code {response.status_code}")
                    time.sleep(RETRY_DELAY)
            except Exception as e:
                logger.error(f"Error searching FDA API: {e}")
                time.sleep(RETRY_DELAY)
        
        return False, []
    
    def search_csr_documents(self, application_number: str) -> List[Dict[str, Any]]:
        """
        Search for CSR documents for a specific drug application
        
        Args:
            application_number: FDA drug application number
            
        Returns:
            List of CSR document metadata
        """
        # First, check if we already have CSR links for this application
        self.cursor.execute("SELECT csr_links FROM fda_reports WHERE application_number = ?", (application_number,))
        result = self.cursor.fetchone()
        
        if result and result[0]:
            try:
                return json.loads(result[0])
            except json.JSONDecodeError:
                logger.warning(f"Invalid CSR links JSON for {application_number}")
        
        # Search for CSR documents
        documents = []
        url = f"{FDA_WEB_BASE}nda/{application_number.lower()}/{application_number.lower()}_index.cfm"
        
        for attempt in range(MAX_RETRY_ATTEMPTS):
            try:
                # Update session for each attempt
                if attempt > 0:
                    self._update_session()
                
                logger.info(f"Searching for CSR documents for application {application_number}")
                
                response = self.session.get(url, timeout=15)
                
                if response.status_code == 200:
                    # Parse the HTML to find clinical study report links
                    html = response.text
                    
                    # Look for clinical study report links
                    csr_pattern = r'href="([^"]+\.pdf)"[^>]*>([^<]*(?:clinical\s+study\s+report|clinical\s+trial\s+report|study\s+report|csr)[^<]*)'
                    csr_matches = re.finditer(csr_pattern, html, re.IGNORECASE)
                    
                    for match in csr_matches:
                        href = match.group(1)
                        title = match.group(2).strip()
                        
                        # Make sure the href is an absolute URL
                        if href.startswith('/'):
                            download_url = urljoin(FDA_WEB_BASE, href)
                        elif not href.startswith(('http://', 'https://')):
                            download_url = urljoin(f"{FDA_WEB_BASE}nda/{application_number.lower()}/", href)
                        else:
                            download_url = href
                        
                        documents.append({
                            'title': title,
                            'download_url': download_url,
                            'application_number': application_number
                        })
                    
                    # Also look for medical review documents, which often contain CSR information
                    review_pattern = r'href="([^"]+\.pdf)"[^>]*>([^<]*(?:medical\s+review|clinical\s+review|statistical\s+review)[^<]*)'
                    review_matches = re.finditer(review_pattern, html, re.IGNORECASE)
                    
                    for match in review_matches:
                        href = match.group(1)
                        title = match.group(2).strip()
                        
                        # Make sure the href is an absolute URL
                        if href.startswith('/'):
                            download_url = urljoin(FDA_WEB_BASE, href)
                        elif not href.startswith(('http://', 'https://')):
                            download_url = urljoin(f"{FDA_WEB_BASE}nda/{application_number.lower()}/", href)
                        else:
                            download_url = href
                        
                        documents.append({
                            'title': title,
                            'download_url': download_url,
                            'application_number': application_number
                        })
                    
                    # Store the document links
                    if documents:
                        self.cursor.execute("UPDATE fda_reports SET csr_links = ? WHERE application_number = ?",
                                        (json.dumps(documents), application_number))
                        self.conn.commit()
                    
                    logger.info(f"Found {len(documents)} CSR/review documents for application {application_number}")
                    return documents
                else:
                    logger.warning(f"Failed to fetch document page with status {response.status_code}")
                    # Try an alternative URL format
                    alt_url = f"{FDA_WEB_BASE}nda/{application_number.lower()[:5]}/{application_number.lower()[5:]}/{application_number.lower()}_index.cfm"
                    response = self.session.get(alt_url, timeout=15)
                    
                    if response.status_code == 200:
                        # Process same as above
                        html = response.text
                        
                        # Look for clinical study report links
                        csr_pattern = r'href="([^"]+\.pdf)"[^>]*>([^<]*(?:clinical\s+study\s+report|clinical\s+trial\s+report|study\s+report|csr)[^<]*)'
                        csr_matches = re.finditer(csr_pattern, html, re.IGNORECASE)
                        
                        for match in csr_matches:
                            href = match.group(1)
                            title = match.group(2).strip()
                            
                            # Make sure the href is an absolute URL
                            if href.startswith('/'):
                                download_url = urljoin(FDA_WEB_BASE, href)
                            elif not href.startswith(('http://', 'https://')):
                                download_url = urljoin(f"{FDA_WEB_BASE}nda/{application_number.lower()[:5]}/{application_number.lower()[5:]}/", href)
                            else:
                                download_url = href
                            
                            documents.append({
                                'title': title,
                                'download_url': download_url,
                                'application_number': application_number
                            })
                        
                        # Also look for medical review documents
                        review_pattern = r'href="([^"]+\.pdf)"[^>]*>([^<]*(?:medical\s+review|clinical\s+review|statistical\s+review)[^<]*)'
                        review_matches = re.finditer(review_pattern, html, re.IGNORECASE)
                        
                        for match in review_matches:
                            href = match.group(1)
                            title = match.group(2).strip()
                            
                            # Make sure the href is an absolute URL
                            if href.startswith('/'):
                                download_url = urljoin(FDA_WEB_BASE, href)
                            elif not href.startswith(('http://', 'https://')):
                                download_url = urljoin(f"{FDA_WEB_BASE}nda/{application_number.lower()[:5]}/{application_number.lower()[5:]}/", href)
                            else:
                                download_url = href
                            
                            documents.append({
                                'title': title,
                                'download_url': download_url,
                                'application_number': application_number
                            })
                        
                        # Store the document links
                        if documents:
                            self.cursor.execute("UPDATE fda_reports SET csr_links = ? WHERE application_number = ?",
                                            (json.dumps(documents), application_number))
                            self.conn.commit()
                        
                        logger.info(f"Found {len(documents)} CSR/review documents for application {application_number} (alt URL)")
                        return documents
                    else:
                        logger.error(f"Failed to fetch document page with status {response.status_code} (alt URL)")
                    
                    time.sleep(RETRY_DELAY)
            except Exception as e:
                logger.error(f"Error searching for CSR documents: {e}")
                time.sleep(RETRY_DELAY)
        
        return documents
    
    def download_document(self, document: Dict[str, Any]) -> Tuple[bool, str]:
        """
        Download a CSR document
        
        Args:
            document: Document metadata including download URL
            
        Returns:
            Tuple of (success flag, file path or error message)
        """
        download_url = document.get('download_url')
        title = document.get('title', 'Unknown')
        application_number = document.get('application_number')
        
        if not download_url or not application_number:
            return False, "Missing download URL or application number"
        
        # Create a safe filename
        safe_title = re.sub(r'[^a-zA-Z0-9_-]', '_', title)
        safe_id = re.sub(r'[^a-zA-Z0-9_-]', '_', application_number)
        filename = f"{safe_id}_{safe_title[:50]}.pdf"
        file_path = os.path.join(self.target_dir, filename)
        
        # Skip if already downloaded
        if os.path.exists(file_path):
            logger.info(f"Document already downloaded: {file_path}")
            self.cursor.execute(
                "UPDATE fda_reports SET download_status = ?, download_date = ?, file_path = ?, file_size = ? WHERE application_number = ?",
                ('downloaded', datetime.now().isoformat(), file_path, os.path.getsize(file_path), application_number)
            )
            self.conn.commit()
            self.total_downloaded += 1
            return True, file_path
        
        for attempt in range(MAX_RETRY_ATTEMPTS):
            try:
                # Update session for each attempt
                if attempt > 0:
                    self._update_session()
                
                logger.info(f"Downloading document from {download_url}")
                
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
                    
                    # Update database
                    self.cursor.execute(
                        "UPDATE fda_reports SET download_status = ?, download_date = ?, file_path = ?, file_size = ? WHERE application_number = ?",
                        ('downloaded', datetime.now().isoformat(), file_path, file_size, application_number)
                    )
                    self.conn.commit()
                    
                    # Update stats
                    self.total_downloaded += 1
                    
                    logger.info(f"Successfully downloaded document to {file_path}")
                    return True, file_path
                else:
                    logger.error(f"Download failed: {response.status_code}")
                    time.sleep(RETRY_DELAY)
            except Exception as e:
                logger.error(f"Error downloading document: {e}")
                time.sleep(RETRY_DELAY)
        
        # If all attempts failed
        self.cursor.execute(
            "UPDATE fda_reports SET download_status = ?, notes = ? WHERE application_number = ?",
            ('failed', f"Download failed after {MAX_RETRY_ATTEMPTS} attempts", application_number)
        )
        self.conn.commit()
        
        self.total_failed += 1
        error_message = f"Failed to download after {MAX_RETRY_ATTEMPTS} attempts"
        
        return False, error_message
    
    def process_application(self, application: Dict[str, Any], search_term: str = "") -> bool:
        """
        Process a drug application and look for CSR documents
        
        Args:
            application: Drug application data from FDA API
            search_term: The search term used to find this application
            
        Returns:
            True if CSR documents were found, False otherwise
        """
        application_number = application.get("application_number")
        
        if not application_number:
            logger.warning("Application missing application number")
            return False
        
        # Check if already processed
        self.cursor.execute("SELECT application_number FROM fda_reports WHERE application_number = ?", (application_number,))
        if self.cursor.fetchone():
            logger.info(f"Application {application_number} already processed")
            return True
        
        # Extract application data
        drug_name = application.get("products", [{}])[0].get("brand_name") if application.get("products") else None
        manufacturer = application.get("sponsor_name")
        approval_date = application.get("approval_date")
        submission_status = application.get("applications", [{}])[0].get("submission_status_date") if application.get("applications") else None
        submission_type = application.get("applications", [{}])[0].get("submission_type") if application.get("applications") else None
        review_priority = application.get("applications", [{}])[0].get("review_priority") if application.get("applications") else None
        
        # Insert into database
        self.cursor.execute('''
        INSERT OR IGNORE INTO fda_reports (
            application_number, drug_name, manufacturer, approval_date, 
            approval_type, search_term, submission_status, review_priority
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            application_number, drug_name, manufacturer, approval_date,
            submission_type, search_term, submission_status, review_priority
        ))
        self.conn.commit()
        
        # Search for CSR documents
        csr_documents = self.search_csr_documents(application_number)
        
        # Update stats
        if csr_documents:
            logger.info(f"Found {len(csr_documents)} CSR documents for {drug_name} ({application_number})")
            return True
        else:
            logger.info(f"No CSR documents found for {drug_name} ({application_number})")
            self.cursor.execute(
                "UPDATE fda_reports SET notes = ? WHERE application_number = ?",
                ("No CSR documents found", application_number)
            )
            self.conn.commit()
            return False
    
    def search_and_process(self, 
                         search_terms: List[str], 
                         limit: int = 100, 
                         total_limit: Optional[int] = None) -> Dict[str, Any]:
        """
        Search for drug approvals and process them to find CSR documents
        
        Args:
            search_terms: List of search terms
            limit: Number of results per search
            total_limit: Maximum total number of applications to process
            
        Returns:
            Dictionary with search results
        """
        results = {
            "total_applications": 0,
            "applications_with_csrs": 0,
            "total_csrs_found": 0,
            "downloaded": 0,
            "failed": 0,
            "by_search_term": {}
        }
        
        # Start from where we left off if resuming
        if self.progress_data.get("last_search_term") in search_terms:
            idx = search_terms.index(self.progress_data["last_search_term"])
            search_terms = search_terms[idx:]
            skip = self.progress_data.get("last_search_skip", 0)
        else:
            skip = 0
        
        for search_term in search_terms:
            term_results = {
                "applications": 0,
                "applications_with_csrs": 0,
                "csrs_found": 0
            }
            
            more_results = True
            current_skip = skip if search_term == self.progress_data.get("last_search_term") else 0
            
            while more_results:
                # Check if we've reached the total limit
                if total_limit and results["total_applications"] >= total_limit:
                    logger.info(f"Reached total limit of {total_limit} applications")
                    break
                
                # Search for applications
                success, applications = self.search_drug_approvals(
                    search_term=search_term,
                    limit=limit,
                    skip=current_skip
                )
                
                if not success or not applications:
                    logger.info(f"No more results for {search_term}")
                    more_results = False
                    continue
                
                # Process each application
                for application in applications:
                    # Check if we've reached the total limit
                    if total_limit and results["total_applications"] >= total_limit:
                        break
                    
                    results["total_applications"] += 1
                    term_results["applications"] += 1
                    
                    # Update progress
                    self.progress_data["applications_processed"] = results["total_applications"]
                    self.progress_data["last_search_term"] = search_term
                    self.progress_data["last_search_skip"] = current_skip
                    self._save_progress()
                    
                    has_csrs = self.process_application(application, search_term)
                    
                    if has_csrs:
                        results["applications_with_csrs"] += 1
                        term_results["applications_with_csrs"] += 1
                
                # Move to next page
                current_skip += len(applications)
                
                # Save current progress
                self._save_progress()
                
                # Avoid hitting rate limits
                time.sleep(1)
            
            # Add search term to processed list
            if search_term not in self.progress_data["search_terms_processed"]:
                self.progress_data["search_terms_processed"].append(search_term)
            
            # Save search term results
            results["by_search_term"][search_term] = term_results
            
            # Reset skip for next search term
            skip = 0
        
        # Count CSRs found
        self.cursor.execute("SELECT COUNT(*) FROM fda_reports WHERE csr_links IS NOT NULL AND csr_links != '[]'")
        results["total_csrs_found"] = self.cursor.fetchone()[0]
        
        # Count by download status
        self.cursor.execute("SELECT COUNT(*) FROM fda_reports WHERE download_status = 'downloaded'")
        results["downloaded"] = self.cursor.fetchone()[0]
        
        self.cursor.execute("SELECT COUNT(*) FROM fda_reports WHERE download_status = 'failed'")
        results["failed"] = self.cursor.fetchone()[0]
        
        # Save final progress
        self.progress_data["applications_processed"] = results["total_applications"]
        self._save_progress()
        
        return results
    
    def download_pending_documents(self, limit: Optional[int] = None) -> Dict[str, Any]:
        """
        Download pending CSR documents
        
        Args:
            limit: Maximum number of documents to download
            
        Returns:
            Dictionary with download results
        """
        results = {
            "total_pending": 0,
            "downloaded": 0,
            "failed": 0
        }
        
        # Get applications with pending downloads
        self.cursor.execute('''
        SELECT application_number, csr_links FROM fda_reports 
        WHERE csr_links IS NOT NULL AND csr_links != '[]' 
        AND (download_status = 'pending' OR download_status IS NULL)
        ''')
        
        pending_applications = self.cursor.fetchall()
        results["total_pending"] = len(pending_applications)
        
        logger.info(f"Found {results['total_pending']} applications with pending downloads")
        
        downloaded = 0
        
        for app_num, csr_links_json in pending_applications:
            # Check if we've reached the limit
            if limit and downloaded >= limit:
                logger.info(f"Reached download limit of {limit} documents")
                break
            
            try:
                csr_documents = json.loads(csr_links_json)
            except (json.JSONDecodeError, TypeError):
                logger.error(f"Invalid CSR links JSON for {app_num}")
                continue
            
            # Download each document
            for doc in csr_documents:
                # Check if we've reached the limit
                if limit and downloaded >= limit:
                    break
                
                # Add application number to the document data
                doc['application_number'] = app_num
                
                # Download the document
                success, _ = self.download_document(doc)
                
                if success:
                    downloaded += 1
                    results["downloaded"] += 1
                else:
                    results["failed"] += 1
                
                # Save progress
                self._save_progress()
                
                # Avoid hitting rate limits
                time.sleep(2)
        
        return results
    
    def get_status(self) -> Dict[str, Any]:
        """Get current status"""
        # Count applications
        self.cursor.execute("SELECT COUNT(*) FROM fda_reports")
        total_applications = self.cursor.fetchone()[0]
        
        # Count applications with CSRs
        self.cursor.execute("SELECT COUNT(*) FROM fda_reports WHERE csr_links IS NOT NULL AND csr_links != '[]'")
        applications_with_csrs = self.cursor.fetchone()[0]
        
        # Count by download status
        self.cursor.execute("SELECT COUNT(*) FROM fda_reports WHERE download_status = 'downloaded'")
        downloaded = self.cursor.fetchone()[0]
        
        self.cursor.execute("SELECT COUNT(*) FROM fda_reports WHERE download_status = 'pending' OR download_status IS NULL")
        pending = self.cursor.fetchone()[0]
        
        self.cursor.execute("SELECT COUNT(*) FROM fda_reports WHERE download_status = 'failed'")
        failed = self.cursor.fetchone()[0]
        
        # Count by import status
        self.cursor.execute("SELECT COUNT(*) FROM fda_reports WHERE import_status = 'imported'")
        imported = self.cursor.fetchone()[0]
        
        self.cursor.execute("SELECT COUNT(*) FROM fda_reports WHERE import_status = 'pending'")
        pending_import = self.cursor.fetchone()[0]
        
        # Get top drugs
        self.cursor.execute('''
        SELECT drug_name, COUNT(*) FROM fda_reports 
        WHERE drug_name IS NOT NULL
        GROUP BY drug_name
        ORDER BY COUNT(*) DESC
        LIMIT 10
        ''')
        top_drugs = dict(self.cursor.fetchall())
        
        return {
            "total_applications": total_applications,
            "applications_with_csrs": applications_with_csrs,
            "download_status": {
                "downloaded": downloaded,
                "pending": pending,
                "failed": failed
            },
            "import_status": {
                "imported": imported,
                "pending": pending_import
            },
            "top_drugs": top_drugs,
            "last_updated": self.progress_data.get("last_updated"),
            "applications_processed": self.progress_data.get("applications_processed", 0),
            "search_terms_processed": self.progress_data.get("search_terms_processed", [])
        }

def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(description="Download CSRs from the FDA")
    parser.add_argument("-s", "--search", nargs="+", help="Search terms to use")
    parser.add_argument("-l", "--limit", type=int, default=100, help="Limit results per search")
    parser.add_argument("-t", "--total", type=int, help="Total limit of applications to process")
    parser.add_argument("-d", "--download", action="store_true", help="Download pending documents")
    parser.add_argument("--download-limit", type=int, help="Limit number of documents to download")
    parser.add_argument("--status", action="store_true", help="Show current status and exit")
    parser.add_argument("-o", "--output-dir", default=DOWNLOAD_DIR, help="Directory to save CSRs")
    args = parser.parse_args()
    
    downloader = FdaCsrDownloader(target_dir=args.output_dir)
    
    if args.status:
        status = downloader.get_status()
        
        print("\nFDA CSR Downloader Status:")
        print("========================")
        print(f"Total applications: {status['total_applications']}")
        print(f"Applications with CSRs: {status['applications_with_csrs']}")
        print("\nDownload Status:")
        print(f"  Downloaded: {status['download_status']['downloaded']}")
        print(f"  Pending: {status['download_status']['pending']}")
        print(f"  Failed: {status['download_status']['failed']}")
        print("\nImport Status:")
        print(f"  Imported: {status['import_status']['imported']}")
        print(f"  Pending: {status['import_status']['pending']}")
        
        if status['top_drugs']:
            print("\nTop Drugs:")
            for drug, count in status['top_drugs'].items():
                print(f"  {drug}: {count}")
        
        if status['last_updated']:
            print(f"\nLast updated: {status['last_updated']}")
        
        print(f"Applications processed: {status['applications_processed']}")
        
        if status['search_terms_processed']:
            print("\nSearch terms processed:")
            for term in status['search_terms_processed']:
                print(f"  {term}")
        
        return 0
    
    # Default search terms if none provided
    search_terms = args.search if args.search else [
        "clinical trial", "clinical study", "phase 3", "phase III",
        "oncology", "cancer", "diabetes", "hypertension", "depression",
        "cardiovascular", "arthritis", "asthma", "COPD", "Alzheimer",
        "psoriasis", "multiple sclerosis", "HIV", "hepatitis"
    ]
    
    if args.download:
        print(f"Downloading pending CSR documents...")
        result = downloader.download_pending_documents(limit=args.download_limit)
        
        print("\nDownload Summary:")
        print("================")
        print(f"Total pending: {result['total_pending']}")
        print(f"Downloaded: {result['downloaded']}")
        print(f"Failed: {result['failed']}")
    else:
        print(f"Searching for drug approvals using {len(search_terms)} search terms...")
        result = downloader.search_and_process(
            search_terms=search_terms,
            limit=args.limit,
            total_limit=args.total
        )
        
        print("\nSearch Summary:")
        print("==============")
        print(f"Total applications processed: {result['total_applications']}")
        print(f"Applications with CSRs: {result['applications_with_csrs']}")
        print(f"Total CSRs found: {result['total_csrs_found']}")
        print(f"Downloaded: {result['downloaded']}")
        print(f"Failed: {result['failed']}")
        
        print("\nBy Search Term:")
        for term, stats in result["by_search_term"].items():
            print(f"  {term}:")
            print(f"    Applications: {stats['applications']}")
            print(f"    With CSRs: {stats['applications_with_csrs']}")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())