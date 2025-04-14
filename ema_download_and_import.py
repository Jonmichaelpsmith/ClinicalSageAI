#!/usr/bin/env python3
"""
EMA CSR Download and Import Script
----------------------------------
This script coordinates downloading CSRs from the EMA API and importing them
into the CSR database. It handles the end-to-end process of:

1. Testing EMA API connectivity with fallback options
2. Downloading CSRs in batches with parallel processing
3. Importing downloaded CSRs into the database
4. Tracking progress for interrupted downloads

Usage:
  python ema_download_and_import.py --batch-size 10 --limit 100

This will download up to 100 CSRs in batches of 10 each, then import them
into the CSR database.
"""

import os
import sys
import time
import argparse
import logging
import sqlite3
from datetime import datetime
from typing import Dict, List, Any, Optional, Tuple
import subprocess
import json

# Import custom modules
try:
    from download_ema_bulk import BulkDownloader, DEFAULT_BATCH_SIZE
    from import_pdfs_to_csr import import_pdf_to_csr, setup_database
except ImportError:
    print("Required modules not found. Make sure download_ema_bulk.py and import_pdfs_to_csr.py exist.")
    sys.exit(1)

# Paths
DOWNLOAD_DIR = "downloaded_csrs"
PROGRESS_FILE = "ema_import_progress.json"
LOG_FILE = "ema_import.log"

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(LOG_FILE)
    ]
)
logger = logging.getLogger("ema-import")


class EmaImportManager:
    """Manages the EMA CSR download and import process"""
    
    def __init__(self, download_dir: str = DOWNLOAD_DIR, progress_file: str = PROGRESS_FILE):
        """Initialize the import manager"""
        self.download_dir = download_dir
        self.progress_file = progress_file
        self.downloader = BulkDownloader(target_dir=download_dir)
        
        # Create download directory
        os.makedirs(download_dir, exist_ok=True)
        
        # Initialize progress tracking
        self.progress = self._load_progress()
        
        # Init stats
        self.total_downloaded = 0
        self.total_imported = 0
        self.total_failed = 0
    
    def _load_progress(self) -> Dict[str, Any]:
        """Load saved import progress if available"""
        if os.path.exists(self.progress_file):
            try:
                with open(self.progress_file, 'r') as f:
                    return json.load(f)
            except json.JSONDecodeError:
                logger.warning(f"Progress file {self.progress_file} is corrupt. Creating a new one.")
        
        # Return default progress structure
        return {
            'last_run': None,
            'downloaded_files': [],
            'imported_files': [],
            'failed_imports': [],
            'total_csrs_available': 0,
            'total_csrs_downloaded': 0,
            'total_csrs_imported': 0,
            'total_csrs_failed': 0
        }
    
    def _save_progress(self):
        """Save current import progress"""
        # Update stats
        self.progress['last_run'] = datetime.now().isoformat()
        self.progress['total_csrs_downloaded'] = len(self.progress['downloaded_files'])
        self.progress['total_csrs_imported'] = len(self.progress['imported_files'])
        self.progress['total_csrs_failed'] = len(self.progress['failed_imports'])
        
        # Save to file
        with open(self.progress_file, 'w') as f:
            json.dump(self.progress, f, indent=2)
            
        logger.info(f"Progress saved: {self.progress['total_csrs_downloaded']} downloaded, "
                   f"{self.progress['total_csrs_imported']} imported, "
                   f"{self.progress['total_csrs_failed']} failed")
    
    def download_csrs(self, limit: Optional[int] = None, batch_size: int = DEFAULT_BATCH_SIZE) -> Dict[str, Any]:
        """Download CSRs from the EMA API"""
        try:
            # First update credentials and find working endpoint
            logger.info("Testing EMA API connectivity...")
            subprocess.run([sys.executable, "update_ema_credentials.py"], check=True)
            
            # Download CSRs
            logger.info(f"Downloading up to {limit if limit else 'all'} CSRs in batches of {batch_size}...")
            result = self.downloader.bulk_download(limit=limit, batch_size=batch_size)
            
            # Update progress tracking
            self.total_downloaded = result.get('downloaded', 0)
            self.progress['total_csrs_available'] = result.get('reports_found', 0)
            
            # Add downloaded files to progress
            db_conn = sqlite3.connect(self.downloader.conn.execute("PRAGMA database_list").fetchone()[2])
            cursor = db_conn.cursor()
            cursor.execute("SELECT report_id, file_path FROM ema_reports WHERE import_status = 'pending'")
            new_downloads = cursor.fetchall()
            
            for report_id, file_path in new_downloads:
                if file_path and os.path.exists(file_path) and report_id not in self.progress['downloaded_files']:
                    self.progress['downloaded_files'].append({
                        'id': report_id,
                        'path': file_path,
                        'date': datetime.now().isoformat()
                    })
            
            db_conn.close()
            self._save_progress()
            
            return result
        except Exception as e:
            logger.error(f"Error downloading CSRs: {str(e)}")
            return {
                "status": "error",
                "message": str(e),
                "downloaded": 0
            }
    
    def import_downloaded_csrs(self) -> Dict[str, Any]:
        """Import downloaded CSRs into the database"""
        # First get list of CSRs to import
        to_import = []
        
        # Find files that are downloaded but not imported
        downloaded_ids = set(item['id'] for item in self.progress['downloaded_files'])
        imported_ids = set(item['id'] for item in self.progress['imported_files'])
        failed_ids = set(item['id'] for item in self.progress['failed_imports'])
        
        pending_ids = downloaded_ids - imported_ids - failed_ids
        
        # Get file paths for pending imports
        for item in self.progress['downloaded_files']:
            if item['id'] in pending_ids:
                file_path = item['path']
                if os.path.exists(file_path):
                    to_import.append((item['id'], file_path))
        
        if not to_import:
            logger.info("No new CSRs to import")
            return {
                "status": "complete",
                "imported": 0,
                "failed": 0
            }
        
        # Setup import database connection
        try:
            setup_database()
        except Exception as e:
            logger.error(f"Error setting up import database: {str(e)}")
            return {
                "status": "error",
                "message": str(e),
                "imported": 0,
                "failed": 0
            }
        
        # Import CSRs one by one
        logger.info(f"Importing {len(to_import)} CSRs...")
        imported = 0
        failed = 0
        
        for report_id, file_path in to_import:
            try:
                logger.info(f"Importing {file_path}...")
                import_result = import_pdf_to_csr(file_path)
                
                if import_result:
                    # Update EMA reports database
                    self.downloader.cursor.execute(
                        "UPDATE ema_reports SET import_status = 'imported' WHERE report_id = ?",
                        (report_id,)
                    )
                    self.downloader.conn.commit()
                    
                    # Update progress
                    self.progress['imported_files'].append({
                        'id': report_id,
                        'path': file_path,
                        'date': datetime.now().isoformat()
                    })
                    imported += 1
                    
                    # Save progress every 5 imports
                    if imported % 5 == 0:
                        self._save_progress()
                else:
                    logger.error(f"Failed to import {file_path}")
                    
                    # Update EMA reports database
                    self.downloader.cursor.execute(
                        "UPDATE ema_reports SET import_status = 'failed' WHERE report_id = ?",
                        (report_id,)
                    )
                    self.downloader.conn.commit()
                    
                    # Update progress
                    self.progress['failed_imports'].append({
                        'id': report_id,
                        'path': file_path,
                        'date': datetime.now().isoformat(),
                        'error': "Import function returned False"
                    })
                    failed += 1
            except Exception as e:
                logger.error(f"Error importing {file_path}: {str(e)}")
                
                # Update EMA reports database
                self.downloader.cursor.execute(
                    "UPDATE ema_reports SET import_status = 'failed' WHERE report_id = ?",
                    (report_id,)
                )
                self.downloader.conn.commit()
                
                # Update progress
                self.progress['failed_imports'].append({
                    'id': report_id,
                    'path': file_path,
                    'date': datetime.now().isoformat(),
                    'error': str(e)
                })
                failed += 1
        
        # Final progress save
        self.total_imported = imported
        self.total_failed = failed
        self._save_progress()
        
        return {
            "status": "complete",
            "imported": imported,
            "failed": failed
        }
    
    def retry_failed_imports(self) -> Dict[str, Any]:
        """Retry previously failed imports"""
        if not self.progress['failed_imports']:
            logger.info("No failed imports to retry")
            return {
                "status": "complete",
                "retried": 0,
                "succeeded": 0
            }
        
        # Get failed imports
        failed_imports = self.progress['failed_imports']
        logger.info(f"Retrying {len(failed_imports)} failed imports...")
        
        # Setup import database connection
        try:
            setup_database()
        except Exception as e:
            logger.error(f"Error setting up import database: {str(e)}")
            return {
                "status": "error",
                "message": str(e)
            }
        
        # Retry imports
        retried = 0
        succeeded = 0
        
        for import_item in failed_imports[:]:  # Use slice to create a copy for iteration
            report_id = import_item['id']
            file_path = import_item['path']
            
            if not os.path.exists(file_path):
                logger.warning(f"File {file_path} no longer exists, cannot retry")
                continue
                
            retried += 1
            try:
                logger.info(f"Retrying import of {file_path}...")
                import_result = import_pdf_to_csr(file_path)
                
                if import_result:
                    # Update EMA reports database
                    self.downloader.cursor.execute(
                        "UPDATE ema_reports SET import_status = 'imported' WHERE report_id = ?",
                        (report_id,)
                    )
                    self.downloader.conn.commit()
                    
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
            except Exception as e:
                logger.error(f"Error retrying import of {file_path}: {str(e)}")
                
                # Update error message
                import_item['error'] = f"Retry failed: {str(e)}"
                import_item['date'] = datetime.now().isoformat()
        
        # Save progress
        self._save_progress()
        
        return {
            "status": "complete",
            "retried": retried,
            "succeeded": succeeded
        }
    
    def get_status(self) -> Dict[str, Any]:
        """Get current import status"""
        # Get status from downloader
        download_status = self.downloader.get_progress_summary()
        
        # Calculate progress percentages
        available = download_status.get('total_reports_available', 0)
        downloaded = len(self.progress['downloaded_files'])
        imported = len(self.progress['imported_files'])
        failed = len(self.progress['failed_imports'])
        
        download_pct = 0 if available == 0 else (downloaded / available) * 100
        import_pct = 0 if downloaded == 0 else (imported / downloaded) * 100
        
        return {
            "total_available": available,
            "total_downloaded": downloaded,
            "download_percentage": f"{download_pct:.1f}%",
            "total_imported": imported,
            "import_percentage": f"{import_pct:.1f}%",
            "total_failed": failed,
            "last_run": self.progress.get('last_run', 'Never'),
            "working_endpoint": download_status.get('working_endpoint', 'Unknown')
        }
        
    def run_full_pipeline(self, limit: Optional[int] = None, batch_size: int = DEFAULT_BATCH_SIZE) -> Dict[str, Any]:
        """Run the full download and import pipeline"""
        # 1. Download CSRs
        download_result = self.download_csrs(limit=limit, batch_size=batch_size)
        
        if download_result.get('status') == 'error':
            return {
                "status": "error",
                "stage": "download",
                "message": download_result.get('message', 'Unknown error during download'),
                "downloaded": download_result.get('downloaded', 0),
                "imported": 0
            }
        
        # 2. Import downloaded CSRs
        import_result = self.import_downloaded_csrs()
        
        return {
            "status": "complete",
            "downloaded": download_result.get('downloaded', 0),
            "imported": import_result.get('imported', 0),
            "failed": import_result.get('failed', 0),
            "download_dir": self.download_dir
        }


def main():
    """Main entry point for the script"""
    parser = argparse.ArgumentParser(description="Download and import CSRs from EMA API")
    parser.add_argument("-l", "--limit", type=int, help="Maximum number of CSRs to download")
    parser.add_argument("-b", "--batch-size", type=int, default=DEFAULT_BATCH_SIZE, help="Batch size for API requests")
    parser.add_argument("-r", "--retry", action="store_true", help="Retry failed imports")
    parser.add_argument("-s", "--status", action="store_true", help="Show import status and exit")
    parser.add_argument("-d", "--directory", default=DOWNLOAD_DIR, help="Target directory for downloads")
    parser.add_argument("--download-only", action="store_true", help="Download without importing")
    parser.add_argument("--import-only", action="store_true", help="Import without downloading new CSRs")
    args = parser.parse_args()
    
    try:
        manager = EmaImportManager(download_dir=args.directory)
        
        if args.status:
            # Show status and exit
            status = manager.get_status()
            print("\nEMA CSR Import Status:")
            print("======================")
            for key, value in status.items():
                print(f"{key}: {value}")
            return 0
            
        if args.retry:
            # Retry failed imports
            result = manager.retry_failed_imports()
            print(f"\nRetried {result['retried']} failed imports, {result['succeeded']} succeeded")
            return 0
            
        if args.import_only:
            # Import without downloading
            result = manager.import_downloaded_csrs()
            print(f"\nImport complete: {result['imported']} succeeded, {result['failed']} failed")
            return 0
            
        if args.download_only:
            # Download without importing
            result = manager.download_csrs(limit=args.limit, batch_size=args.batch_size)
            print(f"\nDownload complete: {result.get('downloaded', 0)} succeeded, {result.get('failed', 0)} failed")
            return 0
            
        # Run full pipeline
        result = manager.run_full_pipeline(limit=args.limit, batch_size=args.batch_size)
        print(f"\nPipeline complete: {result['downloaded']} downloaded, {result['imported']} imported")
        return 0
            
    except Exception as e:
        logger.error(f"Error in main program: {str(e)}")
        print(f"ERROR: {str(e)}")
        return 1


if __name__ == "__main__":
    sys.exit(main())