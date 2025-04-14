#!/usr/bin/env python3
"""
EMA Web CSR Integration Script
------------------------------
This script integrates the EMA web downloader with the CSR import pipeline.
It handles the entire process of:

1. Downloading CSRs from the EMA web portal
2. Importing the downloaded CSRs into the TrialSage database
3. Tracking progress for interrupted operations

Usage:
  python ema_web_to_csr.py --limit 1000 --output-dir downloaded_csrs
"""

import os
import sys
import time
import argparse
import logging
import json
import sqlite3
from datetime import datetime
from typing import Dict, List, Any, Optional, Tuple
import subprocess

# Import custom modules
import download_ema_web

# Paths
DOWNLOAD_DIR = "downloaded_csrs"
PROGRESS_FILE = "ema_web_import_progress.json"
LOG_FILE = "ema_web_import.log"

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(LOG_FILE)
    ]
)
logger = logging.getLogger("ema-web-import")

class EmaWebImporter:
    """Handles downloading and importing CSRs from the EMA web portal"""
    
    def __init__(self, target_dir=DOWNLOAD_DIR, progress_file=PROGRESS_FILE):
        """Initialize the importer"""
        self.target_dir = target_dir
        self.progress_file = progress_file
        self.downloader = download_ema_web.EmaWebDownloader(target_dir=target_dir)
        
        # Create download directory
        os.makedirs(target_dir, exist_ok=True)
        
        # Initialize progress tracking
        self.progress = self._load_progress()
        
        # Initialize stats
        self.total_downloaded = 0
        self.total_imported = 0
        self.total_failed = 0
        
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
            'imported_files': [],
            'failed_imports': [],
            'import_counts': {
                'total': 0,
                'success': 0,
                'fail': 0
            },
            'last_updated': datetime.now().isoformat()
        }
    
    def _save_progress(self):
        """Save current progress"""
        self.progress['last_updated'] = datetime.now().isoformat()
        self.progress['import_counts']['total'] = len(self.progress['imported_files']) + len(self.progress['failed_imports'])
        self.progress['import_counts']['success'] = len(self.progress['imported_files'])
        self.progress['import_counts']['fail'] = len(self.progress['failed_imports'])
        
        with open(self.progress_file, 'w') as f:
            json.dump(self.progress, f, indent=2)
            
        logger.info(f"Progress saved: {len(self.progress['imported_files'])} imported, "
                   f"{len(self.progress['failed_imports'])} failed")
    
    def import_csr_to_database(self, file_path: str) -> bool:
        """Import a CSR file to the database"""
        try:
            # Get file metadata
            file_name = os.path.basename(file_path)
            file_size = os.path.getsize(file_path)
            
            logger.info(f"Importing CSR from {file_path} ({file_size/1024:.1f} KB)")
            
            # Check if file exists and is a PDF
            if not os.path.exists(file_path):
                logger.error(f"File does not exist: {file_path}")
                return False
                
            if not file_path.lower().endswith('.pdf'):
                logger.error(f"File is not a PDF: {file_path}")
                return False
                
            # Import using the import_pdfs_to_csr.py script
            result = subprocess.run(
                [sys.executable, "import_pdfs_to_csr.py", file_path],
                capture_output=True,
                text=True,
                check=False
            )
            
            if result.returncode == 0:
                logger.info(f"Successfully imported {file_path}")
                return True
            else:
                logger.error(f"Failed to import {file_path}: {result.stderr}")
                return False
        except Exception as e:
            logger.error(f"Error importing CSR: {e}")
            return False
    
    def import_all_pending(self) -> Dict[str, Any]:
        """Import all pending CSRs that have been downloaded"""
        # Connect to the EMA reports database
        conn = sqlite3.connect(download_ema_web.DB_FILE)
        cursor = conn.cursor()
        
        try:
            # Get all pending reports
            cursor.execute("SELECT report_id, file_path FROM ema_reports WHERE import_status = 'pending'")
            pending_reports = cursor.fetchall()
            
            if not pending_reports:
                logger.info("No pending CSRs to import")
                return {
                    "status": "complete",
                    "imported": 0,
                    "failed": 0
                }
            
            logger.info(f"Found {len(pending_reports)} pending CSRs to import")
            
            imported = 0
            failed = 0
            
            for report_id, file_path in pending_reports:
                # Check if the file exists
                if not os.path.exists(file_path):
                    logger.warning(f"File does not exist: {file_path}")
                    cursor.execute("UPDATE ema_reports SET import_status = 'failed' WHERE report_id = ?", (report_id,))
                    conn.commit()
                    failed += 1
                    continue
                
                # Check if already imported
                if report_id in [item.get('id') for item in self.progress['imported_files']]:
                    logger.info(f"CSR {report_id} already imported")
                    cursor.execute("UPDATE ema_reports SET import_status = 'imported' WHERE report_id = ?", (report_id,))
                    conn.commit()
                    imported += 1
                    continue
                
                try:
                    # Import the CSR
                    success = self.import_csr_to_database(file_path)
                    
                    if success:
                        # Update database status
                        cursor.execute("UPDATE ema_reports SET import_status = 'imported' WHERE report_id = ?", (report_id,))
                        conn.commit()
                        
                        # Update progress
                        self.progress['imported_files'].append({
                            'id': report_id,
                            'path': file_path,
                            'date': datetime.now().isoformat()
                        })
                        
                        imported += 1
                        self.total_imported += 1
                    else:
                        # Update database status
                        cursor.execute("UPDATE ema_reports SET import_status = 'failed' WHERE report_id = ?", (report_id,))
                        conn.commit()
                        
                        # Update progress
                        self.progress['failed_imports'].append({
                            'id': report_id,
                            'path': file_path,
                            'date': datetime.now().isoformat(),
                            'error': "Import function returned False"
                        })
                        
                        failed += 1
                        self.total_failed += 1
                    
                    # Save progress every 5 imports
                    if (imported + failed) % 5 == 0:
                        self._save_progress()
                except Exception as e:
                    logger.error(f"Error importing {file_path}: {e}")
                    
                    # Update database status
                    cursor.execute("UPDATE ema_reports SET import_status = 'failed' WHERE report_id = ?", (report_id,))
                    conn.commit()
                    
                    # Update progress
                    self.progress['failed_imports'].append({
                        'id': report_id,
                        'path': file_path,
                        'date': datetime.now().isoformat(),
                        'error': str(e)
                    })
                    
                    failed += 1
                    self.total_failed += 1
            
            # Final progress save
            self._save_progress()
            
            return {
                "status": "complete",
                "imported": imported,
                "failed": failed
            }
        finally:
            conn.close()
    
    def retry_failed_imports(self) -> Dict[str, Any]:
        """Retry previously failed imports"""
        if not self.progress['failed_imports']:
            logger.info("No failed imports to retry")
            return {
                "status": "complete",
                "retried": 0,
                "succeeded": 0
            }
        
        # Connect to the database
        conn = sqlite3.connect(download_ema_web.DB_FILE)
        cursor = conn.cursor()
        
        try:
            retried = 0
            succeeded = 0
            
            for import_item in self.progress['failed_imports'][:]:  # Use slice to create a copy for iteration
                report_id = import_item['id']
                file_path = import_item['path']
                
                if not os.path.exists(file_path):
                    logger.warning(f"File {file_path} no longer exists, cannot retry")
                    continue
                
                retried += 1
                logger.info(f"Retrying import of {file_path}")
                
                try:
                    # Retry the import
                    success = self.import_csr_to_database(file_path)
                    
                    if success:
                        # Update database status
                        cursor.execute("UPDATE ema_reports SET import_status = 'imported' WHERE report_id = ?", (report_id,))
                        conn.commit()
                        
                        # Remove from failed list
                        self.progress['failed_imports'].remove(import_item)
                        
                        # Add to imported list
                        self.progress['imported_files'].append({
                            'id': report_id,
                            'path': file_path,
                            'date': datetime.now().isoformat()
                        })
                        
                        succeeded += 1
                    else:
                        logger.error(f"Failed to import {file_path} again")
                        
                        # Update error message and date
                        import_item['error'] = "Retry failed: Import function returned False"
                        import_item['date'] = datetime.now().isoformat()
                except Exception as e:
                    logger.error(f"Error retrying import of {file_path}: {e}")
                    
                    # Update error message and date
                    import_item['error'] = f"Retry failed: {str(e)}"
                    import_item['date'] = datetime.now().isoformat()
                
                # Save progress after each retry
                self._save_progress()
            
            return {
                "status": "complete",
                "retried": retried,
                "succeeded": succeeded
            }
        finally:
            conn.close()
    
    def download_and_import(self, limit: Optional[int] = None, search_term: str = "") -> Dict[str, Any]:
        """Download CSRs and import them"""
        # 1. Download CSRs
        logger.info(f"Starting to download up to {limit if limit else 'all'} CSRs...")
        download_result = self.downloader.search_and_download_all(limit=limit, search_term=search_term)
        
        if download_result.get('status') == 'error':
            return {
                "status": "error",
                "stage": "download",
                "message": download_result.get('message', 'Unknown download error'),
                "downloaded": download_result.get('downloaded', 0),
                "imported": 0
            }
        
        # 2. Import the downloaded CSRs
        logger.info("Starting to import downloaded CSRs...")
        import_result = self.import_all_pending()
        
        return {
            "status": "complete",
            "downloaded": download_result.get('downloaded', 0),
            "imported": import_result.get('imported', 0),
            "failed_imports": import_result.get('failed', 0),
            "download_dir": self.target_dir
        }
    
    def get_status(self) -> Dict[str, Any]:
        """Get the current status"""
        # Get download status
        download_status = self.downloader.get_status()
        
        # Get import status
        import_counts = self.progress.get('import_counts', {})
        
        return {
            "downloads": download_status,
            "imports": {
                "total_imported": import_counts.get('success', 0),
                "total_failed": import_counts.get('fail', 0),
                "last_import": self.progress.get('last_run')
            }
        }

def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(description="Download and import CSRs from the EMA web portal")
    parser.add_argument("-l", "--limit", type=int, help="Maximum number of CSRs to download")
    parser.add_argument("-o", "--output-dir", default=DOWNLOAD_DIR, help="Directory to save CSRs")
    parser.add_argument("-s", "--search", default="", help="Optional search term to filter results")
    parser.add_argument("--status", action="store_true", help="Show current status and exit")
    parser.add_argument("--retry", action="store_true", help="Retry failed imports")
    parser.add_argument("--import-only", action="store_true", help="Import without downloading new CSRs")
    parser.add_argument("--download-only", action="store_true", help="Download without importing CSRs")
    args = parser.parse_args()
    
    importer = EmaWebImporter(target_dir=args.output_dir)
    
    if args.status:
        status = importer.get_status()
        print("\nEMA Web Import Status:")
        print("=====================")
        
        print("\nDownload Status:")
        for key, value in status['downloads'].items():
            print(f"  {key}: {value}")
            
        print("\nImport Status:")
        for key, value in status['imports'].items():
            print(f"  {key}: {value}")
            
        return 0
    
    if args.retry:
        result = importer.retry_failed_imports()
        print("\nRetry Summary:")
        print("=============")
        for key, value in result.items():
            print(f"{key}: {value}")
        return 0
    
    if args.import_only:
        result = importer.import_all_pending()
        print("\nImport Summary:")
        print("==============")
        for key, value in result.items():
            print(f"{key}: {value}")
        return 0
    
    if args.download_only:
        result = importer.downloader.search_and_download_all(limit=args.limit, search_term=args.search)
        print("\nDownload Summary:")
        print("================")
        for key, value in result.items():
            print(f"{key}: {value}")
        return 0
    
    # Full process: download and import
    result = importer.download_and_import(limit=args.limit, search_term=args.search)
    
    print("\nFull Import Summary:")
    print("===================")
    for key, value in result.items():
        print(f"{key}: {value}")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())