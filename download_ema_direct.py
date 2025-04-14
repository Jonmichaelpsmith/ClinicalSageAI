#!/usr/bin/env python3
"""
Direct EMA CSR Downloader
------------------------
This script directly downloads Clinical Study Reports (CSRs) from the EMA
using direct URLs to known document repositories instead of searching.

It uses a combination of known patterns and document IDs to access CSRs.
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
DOWNLOAD_DIR = "downloaded_csrs/ema_direct"
DB_FILE = "ema_direct_downloads.db"
PROGRESS_FILE = "ema_direct_progress.json"
MAX_RETRY_ATTEMPTS = 5
RETRY_DELAY = 3  # seconds
LOG_FILE = "ema_direct_downloader.log"

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(LOG_FILE)
    ]
)
logger = logging.getLogger("ema-direct-downloader")

# Known document patterns 
# These are common URL patterns for accessing EMA documents
EMA_DOC_PATTERNS = [
    # Clinical data portal pattern
    "https://clinicaldata.ema.europa.eu/web/cdp/download?documentId={doc_id}",
    # EMA document repository pattern
    "https://www.ema.europa.eu/documents/clinical-study-report/{doc_id}_en.pdf",
    # EMA assessment report pattern
    "https://www.ema.europa.eu/en/documents/assessment-report/{doc_id}_en.pdf"
]

# User agents to rotate
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1"
]

# Rotating IPs (for API keys not set here, use the defaults from the environment)
PROXY_SERVICES = [
    None,  # No proxy
    {
        "http": os.environ.get("HTTP_PROXY"),
        "https": os.environ.get("HTTPS_PROXY")
    },
    {
        "http": "http://proxy.example.com:8080",
        "https": "http://proxy.example.com:8080"
    }
]

# Document ID patterns
# We'll generate document IDs based on these patterns
DOC_ID_PATTERNS = [
    # Pattern: procedureNumber-studyNumber-timestamp 
    # (this is one common format for EMA document IDs)
    "EMEA/H/C/{procedure}/0000/{study}/0000/clinical-study-report",
    "EMEA/H/C/{procedure}/clinical-trial-report-{study}",
    "EMEA/H/C/{procedure}-{study}-clinical-study-report",
    # Assessment report patterns
    "EMEA/H/C/{procedure}-clinical-study-report",
    "EMEA/H/C/{procedure}/0000/clinical-trial-report"
]

# Known procedure numbers (from 1000 to 5999)
# These are procedure numbers for approved medicines
def generate_procedure_numbers():
    """Generate a range of procedure numbers"""
    return list(range(1000, 6000))

# Study numbers (from 1001 to 9999)
def generate_study_numbers():
    """Generate a range of study numbers"""
    return list(range(1001, 10000))

class EmaDirectDownloader:
    """Downloads CSRs directly from EMA using known patterns"""
    
    def __init__(self, target_dir=DOWNLOAD_DIR, progress_file=PROGRESS_FILE):
        """Initialize the downloader"""
        self.target_dir = target_dir
        self.progress_file = progress_file
        self.session = requests.Session()
        
        # Create download directory
        os.makedirs(target_dir, exist_ok=True)
        
        # Initialize database
        self._init_database()
        
        # Load progress
        self.progress = self._load_progress()
        
        # Set up the session with initial headers
        self._update_session()
        
        # Stats
        self.total_downloaded = 0
        self.total_failed = 0
    
    def _update_session(self):
        """Update session with random user agent and proxy"""
        self.session.headers.update({
            'User-Agent': random.choice(USER_AGENTS),
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        })
        
        # Randomly select a proxy configuration or None
        proxy = random.choice(PROXY_SERVICES)
        if proxy and proxy["http"]:
            self.session.proxies = proxy
        else:
            self.session.proxies = {}
    
    def _init_database(self):
        """Initialize the SQLite database to track downloaded CSRs"""
        self.conn = sqlite3.connect(DB_FILE)
        self.cursor = self.conn.cursor()
        
        # Create table if it doesn't exist
        self.cursor.execute('''
        CREATE TABLE IF NOT EXISTS ema_direct_csrs (
            document_id TEXT PRIMARY KEY,
            title TEXT,
            procedure_number TEXT,
            study_number TEXT,
            url TEXT,
            source_pattern TEXT,
            download_date TEXT,
            file_path TEXT,
            file_size INTEGER,
            import_status TEXT DEFAULT 'pending'
        )
        ''')
        self.conn.commit()
    
    def _load_progress(self) -> Dict[str, Any]:
        """Load saved progress if available"""
        if os.path.exists(self.progress_file):
            try:
                with open(self.progress_file, 'r') as f:
                    return json.load(f)
            except json.JSONDecodeError:
                logger.warning(f"Progress file {self.progress_file} is corrupt. Creating a new one.")
        
        # Default progress structure
        return {
            'last_run': None,
            'downloaded_documents': [],
            'failed_documents': [],
            'total_attempts': 0,
            'last_procedure': 1000,
            'last_study': 1001,
            'last_pattern_index': 0,
            'successful_patterns': {},
            'failed_patterns': {},
            'start_time': datetime.now().isoformat(),
            'last_updated': datetime.now().isoformat()
        }
    
    def _save_progress(self):
        """Save current progress"""
        self.progress['last_updated'] = datetime.now().isoformat()
        
        with open(self.progress_file, 'w') as f:
            json.dump(self.progress, f, indent=2)
            
        logger.info(f"Progress saved: {len(self.progress['downloaded_documents'])} downloaded, "
                   f"{len(self.progress['failed_documents'])} failed")
    
    def download_document(self, url: str, document_id: str, procedure_number: str, study_number: str, pattern: str) -> Tuple[bool, str]:
        """
        Download a document from a URL
        
        Args:
            url: Document URL
            document_id: Unique ID for the document
            procedure_number: EMA procedure number
            study_number: Study number
            pattern: Source pattern used to generate the URL
            
        Returns:
            Tuple of (success flag, file path or error message)
        """
        # Check if already downloaded
        self.cursor.execute("SELECT file_path FROM ema_direct_csrs WHERE document_id = ?", (document_id,))
        existing = self.cursor.fetchone()
        
        if existing and existing[0] and os.path.exists(existing[0]):
            logger.info(f"Document {document_id} already downloaded")
            return True, existing[0]
        
        # Create a safe filename
        safe_id = re.sub(r'[^a-zA-Z0-9_-]', '_', document_id)
        filename = f"{safe_id}.pdf"
        file_path = os.path.join(self.target_dir, filename)
        
        for attempt in range(MAX_RETRY_ATTEMPTS):
            try:
                # Update session properties for each attempt
                if attempt > 0:
                    self._update_session()
                
                logger.info(f"Downloading document {document_id} from {url} (attempt {attempt+1})")
                
                response = self.session.get(url, stream=True, timeout=30)
                
                if response.status_code == 200:
                    # Check if it's a PDF
                    content_type = response.headers.get('Content-Type', '')
                    if 'application/pdf' not in content_type and 'application/octet-stream' not in content_type:
                        # If not explicitly a PDF, check the content
                        pdf_header = response.content[:5]
                        if pdf_header != b'%PDF-':
                            logger.warning(f"Downloaded file is not a PDF: {content_type}")
                            time.sleep(RETRY_DELAY)
                            continue
                    
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
                    title = f"Clinical Study Report {procedure_number} Study {study_number}"
                    
                    self.cursor.execute('''
                    INSERT OR REPLACE INTO ema_direct_csrs
                    (document_id, title, procedure_number, study_number, url, source_pattern,
                     download_date, file_path, file_size, import_status)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ''', (
                        document_id,
                        title,
                        procedure_number,
                        study_number,
                        url,
                        pattern,
                        datetime.now().isoformat(),
                        file_path,
                        file_size,
                        'pending'
                    ))
                    self.conn.commit()
                    
                    # Update stats
                    self.total_downloaded += 1
                    
                    # Update successful patterns count
                    self.progress['successful_patterns'][pattern] = self.progress['successful_patterns'].get(pattern, 0) + 1
                    
                    # Add to progress
                    self.progress['downloaded_documents'].append({
                        'id': document_id,
                        'path': file_path,
                        'date': datetime.now().isoformat(),
                        'pattern': pattern,
                        'url': url
                    })
                    
                    self._save_progress()
                    
                    logger.info(f"Successfully downloaded document {document_id} to {file_path}")
                    return True, file_path
                else:
                    logger.warning(f"Download failed with status code {response.status_code}: {url}")
                    time.sleep(RETRY_DELAY)
            except Exception as e:
                logger.error(f"Error downloading document: {e}")
                time.sleep(RETRY_DELAY)
        
        # If all attempts failed
        self.total_failed += 1
        error_message = f"Failed to download after {MAX_RETRY_ATTEMPTS} attempts"
        
        # Update failed patterns count
        self.progress['failed_patterns'][pattern] = self.progress['failed_patterns'].get(pattern, 0) + 1
        
        # Add to failed list
        self.progress['failed_documents'].append({
            'id': document_id,
            'url': url,
            'date': datetime.now().isoformat(),
            'pattern': pattern,
            'error': error_message
        })
        
        self._save_progress()
        
        return False, error_message
    
    def generate_document_ids(self, count: int) -> List[Dict[str, Any]]:
        """
        Generate document IDs based on patterns
        
        Args:
            count: Number of document IDs to generate
            
        Returns:
            List of document ID dictionaries
        """
        document_ids = []
        
        # Get the last-used values from progress
        last_procedure = self.progress.get('last_procedure', 1000)
        last_study = self.progress.get('last_study', 1001)
        last_pattern_index = self.progress.get('last_pattern_index', 0)
        
        # Generate procedures and studies
        procedures = generate_procedure_numbers()
        studies = generate_study_numbers()
        
        # Filter to start from the last used values
        procedures = [p for p in procedures if p >= last_procedure]
        studies = [s for s in studies if s >= last_study]
        
        # Get all combinations of procedures, studies, and patterns
        patterns = DOC_ID_PATTERNS
        total_generated = 0
        
        # Start with patterns that have been successful before
        successful_patterns = self.progress.get('successful_patterns', {})
        sorted_patterns = []
        
        # Sort patterns by success rate
        if successful_patterns:
            sorted_patterns = sorted(patterns, 
                                   key=lambda p: successful_patterns.get(p, 0), 
                                   reverse=True)
        else:
            sorted_patterns = patterns
        
        for procedure in procedures:
            # Reset study counter when moving to a new procedure
            current_studies = studies if procedure > last_procedure else [s for s in studies if s >= last_study]
            
            for study in current_studies:
                # Rotate through patterns
                for pattern_index, pattern in enumerate(sorted_patterns):
                    if total_generated >= count:
                        break
                    
                    # Skip patterns until we reach the last used pattern index
                    # But only for the first procedure/study combination
                    if procedure == last_procedure and study == last_study and pattern_index < last_pattern_index:
                        continue
                    
                    # Format the pattern with the current procedure and study
                    formatted_pattern = pattern.format(
                        procedure=procedure,
                        study=study
                    )
                    
                    # Create document ID
                    doc_id = f"EMA_P{procedure}_S{study}_{pattern_index}"
                    
                    document_ids.append({
                        'document_id': doc_id,
                        'procedure_number': str(procedure),
                        'study_number': str(study),
                        'pattern': pattern,
                        'formatted_pattern': formatted_pattern
                    })
                    
                    total_generated += 1
                    
                    # Update last used values
                    self.progress['last_procedure'] = procedure
                    self.progress['last_study'] = study
                    self.progress['last_pattern_index'] = pattern_index
                
                if total_generated >= count:
                    break
            
            if total_generated >= count:
                break
        
        return document_ids
    
    def generate_urls(self, document_ids: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Generate URLs for document IDs
        
        Args:
            document_ids: List of document ID dictionaries
            
        Returns:
            List of dictionaries with document IDs and URLs
        """
        urls = []
        
        # For each document ID, generate URLs from each pattern
        for doc_info in document_ids:
            doc_id = doc_info['document_id']
            formatted_pattern = doc_info['formatted_pattern']
            
            # Generate URLs from each URL pattern
            for url_pattern in EMA_DOC_PATTERNS:
                url = url_pattern.format(doc_id=formatted_pattern)
                
                urls.append({
                    **doc_info,
                    'url': url,
                    'url_pattern': url_pattern
                })
        
        return urls
    
    def bulk_download(self, limit: Optional[int] = None) -> Dict[str, Any]:
        """
        Generate and download CSR documents
        
        Args:
            limit: Maximum number of documents to download (None for no limit)
            
        Returns:
            Summary of the download process
        """
        # Determine the number of document IDs to generate
        # We generate more than we need because many will fail
        num_to_generate = limit * 10 if limit else 10000
        max_to_download = limit if limit else 10000
        
        # Generate document IDs
        logger.info(f"Generating {num_to_generate} document IDs")
        document_ids = self.generate_document_ids(num_to_generate)
        
        # Generate URLs for each document ID
        logger.info(f"Generating URLs for {len(document_ids)} document IDs")
        urls = self.generate_urls(document_ids)
        
        # Shuffle the URLs to avoid sequential access patterns
        random.shuffle(urls)
        
        # Download each document
        downloaded = 0
        failed = 0
        
        logger.info(f"Attempting to download up to {max_to_download} documents from {len(urls)} URLs")
        
        for url_info in urls:
            # Check if we've reached the download limit
            if downloaded >= max_to_download:
                logger.info(f"Reached download limit of {max_to_download}")
                break
            
            # Update the total attempts
            self.progress['total_attempts'] += 1
            
            # Download the document
            success, _ = self.download_document(
                url=url_info['url'],
                document_id=url_info['document_id'],
                procedure_number=url_info['procedure_number'],
                study_number=url_info['study_number'],
                pattern=url_info['pattern']
            )
            
            if success:
                downloaded += 1
                
                # Save progress every 5 downloads
                if downloaded % 5 == 0:
                    self._save_progress()
            else:
                failed += 1
        
        # Final progress save
        self._save_progress()
        
        return {
            "status": "complete",
            "downloaded": downloaded,
            "failed": failed,
            "total_attempts": self.progress['total_attempts']
        }
    
    def get_status(self) -> Dict[str, Any]:
        """Get current status"""
        # Count documents from database
        self.cursor.execute("SELECT COUNT(*) FROM ema_direct_csrs")
        db_count = self.cursor.fetchone()[0]
        
        # Count by import status
        self.cursor.execute("SELECT COUNT(*) FROM ema_direct_csrs WHERE import_status = 'pending'")
        pending_count = self.cursor.fetchone()[0]
        
        self.cursor.execute("SELECT COUNT(*) FROM ema_direct_csrs WHERE import_status = 'imported'")
        imported_count = self.cursor.fetchone()[0]
        
        self.cursor.execute("SELECT COUNT(*) FROM ema_direct_csrs WHERE import_status = 'failed'")
        failed_count = self.cursor.fetchone()[0]
        
        # Get information about patterns
        successful_patterns = self.progress.get('successful_patterns', {})
        failed_patterns = self.progress.get('failed_patterns', {})
        
        # Find best patterns
        best_patterns = []
        if successful_patterns:
            best_patterns = sorted(
                [(pattern, count) for pattern, count in successful_patterns.items()],
                key=lambda x: x[1],
                reverse=True
            )[:5]
        
        return {
            "total_documents": db_count,
            "pending_import": pending_count,
            "imported": imported_count,
            "failed_import": failed_count,
            "total_attempts": self.progress.get('total_attempts', 0),
            "downloaded": len(self.progress.get('downloaded_documents', [])),
            "failed_downloads": len(self.progress.get('failed_documents', [])),
            "best_patterns": best_patterns,
            "last_procedure": self.progress.get('last_procedure', 0),
            "last_study": self.progress.get('last_study', 0),
            "last_updated": self.progress.get('last_updated')
        }

def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(description="Download CSRs directly from EMA")
    parser.add_argument("-l", "--limit", type=int, help="Maximum number of CSRs to download")
    parser.add_argument("-o", "--output-dir", default=DOWNLOAD_DIR, help="Directory to save CSRs")
    parser.add_argument("--status", action="store_true", help="Show current status and exit")
    args = parser.parse_args()
    
    downloader = EmaDirectDownloader(target_dir=args.output_dir)
    
    if args.status:
        status = downloader.get_status()
        print("\nEMA Direct Downloader Status:")
        print("============================")
        for key, value in status.items():
            if key == 'best_patterns':
                print("\nBest patterns:")
                for pattern, count in value:
                    print(f"  - {pattern}: {count} downloads")
            else:
                print(f"{key}: {value}")
        return 0
    
    result = downloader.bulk_download(limit=args.limit)
    
    print("\nDownload Summary:")
    print("================")
    for key, value in result.items():
        print(f"{key}: {value}")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())