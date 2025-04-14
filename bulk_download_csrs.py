#!/usr/bin/env python3
"""
Bulk CSR Downloader for EMA API
-------------------------------
This script downloads Clinical Study Reports (CSRs) in bulk from the EMA API,
with support for pagination, retries, and resumption of interrupted downloads.
"""

import os
import json
import time
import logging
import argparse
import sqlite3
from datetime import datetime
from typing import List, Dict, Any, Optional, Tuple
import concurrent.futures
import requests
from tqdm import tqdm
import sys

# Import the EMA API client
from ema_api import EmaApiClient, CSR_DATABASE

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("bulk_download.log"),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger('bulk_downloader')

# Constants
DEFAULT_BATCH_SIZE = 50
MAX_WORKERS = 5  # Number of parallel downloads
RETRY_ATTEMPTS = 3
RETRY_DELAY = 5  # seconds
PROGRESS_FILE = "download_progress.json"
DOWNLOAD_DIR = "downloaded_csrs"

class BulkDownloader:
    """Handles bulk downloading of CSRs with progress tracking and resumption."""
    
    def __init__(self, target_dir: str = DOWNLOAD_DIR, progress_file: str = PROGRESS_FILE):
        self.client = EmaApiClient()
        self.target_dir = target_dir
        self.progress_file = progress_file
        self.progress = self._load_progress()
        
        # Ensure target directory exists
        os.makedirs(target_dir, exist_ok=True)
    
    def _load_progress(self) -> Dict[str, Any]:
        """Load saved download progress if available."""
        if os.path.exists(self.progress_file):
            try:
                with open(self.progress_file, 'r') as f:
                    return json.load(f)
            except (json.JSONDecodeError, IOError) as e:
                logger.error(f"Failed to load progress file: {str(e)}")
        
        # Default progress structure
        return {
            "total_found": 0,
            "total_downloaded": 0,
            "last_page": 0,
            "completed_ids": [],
            "failed_ids": [],
            "start_time": datetime.now().isoformat(),
            "last_updated": datetime.now().isoformat()
        }
    
    def _save_progress(self):
        """Save the current download progress."""
        self.progress["last_updated"] = datetime.now().isoformat()
        try:
            with open(self.progress_file, 'w') as f:
                json.dump(self.progress, f, indent=2)
        except IOError as e:
            logger.error(f"Failed to save progress file: {str(e)}")
    
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
        all_reports = []
        page = self.progress["last_page"] + 1 if self.progress["last_page"] > 0 else 1
        more_pages = True
        
        while more_pages:
            try:
                logger.info(f"Searching page {page} with batch size {batch_size}")
                
                # Search for reports
                search_results = self.client.search_csr_reports(
                    therapeutic_area=therapeutic_area,
                    page=page,
                    page_size=batch_size
                )
                
                reports = search_results.get('items', [])
                total_items = search_results.get('totalItems', 0)
                
                if not reports:
                    logger.info("No more reports found")
                    more_pages = False
                    break
                
                logger.info(f"Found {len(reports)} reports on page {page}")
                all_reports.extend(reports)
                
                # Update progress
                self.progress["total_found"] = total_items
                self.progress["last_page"] = page
                self._save_progress()
                
                # If we've reached the end (got fewer items than requested)
                if len(reports) < batch_size:
                    more_pages = False
                else:
                    page += 1
                    
                # Brief pause to avoid overwhelming the API
                time.sleep(1)
                
            except Exception as e:
                logger.error(f"Error searching page {page}: {str(e)}")
                # Retry logic
                retry_count = 0
                while retry_count < RETRY_ATTEMPTS:
                    retry_count += 1
                    logger.info(f"Retrying page {page} (attempt {retry_count}/{RETRY_ATTEMPTS})")
                    time.sleep(RETRY_DELAY * retry_count)  # Exponential backoff
                    
                    try:
                        search_results = self.client.search_csr_reports(
                            therapeutic_area=therapeutic_area,
                            page=page,
                            page_size=batch_size
                        )
                        
                        reports = search_results.get('items', [])
                        if reports:
                            logger.info(f"Retry successful, found {len(reports)} reports")
                            all_reports.extend(reports)
                            page += 1
                            break
                    except Exception as retry_e:
                        logger.error(f"Retry failed: {str(retry_e)}")
                
                if retry_count == RETRY_ATTEMPTS:
                    logger.error(f"Failed to retrieve page {page} after {RETRY_ATTEMPTS} attempts")
                    more_pages = False
        
        logger.info(f"Found a total of {len(all_reports)} reports across all pages")
        return all_reports
    
    def _download_single_report(self, report: Dict[str, Any]) -> Tuple[str, bool, str]:
        """
        Download a single CSR report with retries.
        
        Args:
            report: Report metadata
            
        Returns:
            Tuple of (report_id, success_flag, file_path_or_error_message)
        """
        report_id = report.get('id')
        if not report_id:
            return ('unknown', False, 'Missing report ID')
        
        # Skip if already downloaded
        if report_id in self.progress["completed_ids"]:
            return (report_id, True, 'Already downloaded')
        
        # Try to download the report
        retry_count = 0
        while retry_count <= RETRY_ATTEMPTS:
            try:
                if retry_count > 0:
                    logger.info(f"Retry {retry_count}/{RETRY_ATTEMPTS} for report {report_id}")
                
                file_path = self.client.download_csr_report(report_id, self.target_dir)
                return (report_id, True, file_path)
                
            except Exception as e:
                error_msg = str(e)
                logger.error(f"Failed to download report {report_id}: {error_msg}")
                retry_count += 1
                
                if retry_count <= RETRY_ATTEMPTS:
                    # Exponential backoff
                    sleep_time = RETRY_DELAY * (2 ** (retry_count - 1))
                    time.sleep(sleep_time)
        
        # If we get here, all retries failed
        return (report_id, False, error_msg)
    
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
        # First, search for all available reports
        start_time = time.time()
        logger.info(f"Starting bulk download with batch_size={batch_size}, max_workers={max_workers}")
        
        all_reports = self.search_all_pages(therapeutic_area, batch_size)
        
        # Apply limit if specified
        if limit is not None:
            all_reports = all_reports[:limit]
            logger.info(f"Limited to {limit} reports out of {len(all_reports)} found")
        
        # Filter out already downloaded reports
        pending_reports = [r for r in all_reports if r.get('id') not in self.progress["completed_ids"]]
        logger.info(f"Downloading {len(pending_reports)} reports (skipping {len(all_reports) - len(pending_reports)} already downloaded)")
        
        # Use ThreadPoolExecutor for parallel downloads
        success_count = 0
        failure_count = 0
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
            # Submit all downloads
            future_to_report = {
                executor.submit(self._download_single_report, report): report
                for report in pending_reports
            }
            
            # Process results as they complete
            for future in tqdm(concurrent.futures.as_completed(future_to_report), 
                            total=len(future_to_report),
                            desc="Downloading reports"):
                report = future_to_report[future]
                try:
                    report_id, success, result = future.result()
                    
                    if success:
                        success_count += 1
                        if report_id not in self.progress["completed_ids"]:
                            self.progress["completed_ids"].append(report_id)
                    else:
                        failure_count += 1
                        if report_id not in self.progress["failed_ids"]:
                            self.progress["failed_ids"].append(report_id)
                        logger.error(f"Download failed for report {report_id}: {result}")
                    
                    # Update progress periodically
                    self.progress["total_downloaded"] = len(self.progress["completed_ids"])
                    if (success_count + failure_count) % 10 == 0:
                        self._save_progress()
                        
                except Exception as e:
                    logger.error(f"Error processing download result: {str(e)}")
        
        # Final progress update
        self.progress["total_downloaded"] = len(self.progress["completed_ids"])
        self._save_progress()
        
        elapsed_time = time.time() - start_time
        
        # Prepare result summary
        result = {
            "total_found": len(all_reports),
            "successful": success_count,
            "failed": failure_count,
            "skipped": len(all_reports) - len(pending_reports),
            "elapsed_time": elapsed_time,
            "average_time_per_report": elapsed_time / max(1, success_count),
            "completed_ids": self.progress["completed_ids"],
            "failed_ids": self.progress["failed_ids"]
        }
        
        logger.info(f"Bulk download completed: {success_count} successful, {failure_count} failed, {result['skipped']} skipped")
        logger.info(f"Total elapsed time: {elapsed_time:.1f} seconds")
        
        return result
    
    def retry_failed(self, max_workers: int = MAX_WORKERS) -> Dict[str, Any]:
        """
        Retry downloading previously failed reports.
        
        Args:
            max_workers: Maximum number of parallel downloads
            
        Returns:
            Dict with retry statistics
        """
        failed_ids = self.progress["failed_ids"].copy()
        if not failed_ids:
            logger.info("No failed downloads to retry")
            return {"retried": 0, "successful": 0, "still_failing": 0}
        
        logger.info(f"Retrying {len(failed_ids)} previously failed downloads")
        
        # Clear the failed_ids list before retrying
        self.progress["failed_ids"] = []
        self._save_progress()
        
        success_count = 0
        failure_count = 0
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
            futures = []
            
            for report_id in failed_ids:
                # Create a dummy report object with just the ID
                report = {"id": report_id}
                futures.append(executor.submit(self._download_single_report, report))
            
            for future in tqdm(concurrent.futures.as_completed(futures), 
                            total=len(futures),
                            desc="Retrying failed downloads"):
                try:
                    report_id, success, result = future.result()
                    
                    if success:
                        success_count += 1
                        if report_id not in self.progress["completed_ids"]:
                            self.progress["completed_ids"].append(report_id)
                    else:
                        failure_count += 1
                        if report_id not in self.progress["failed_ids"]:
                            self.progress["failed_ids"].append(report_id)
                    
                    # Update progress periodically
                    self.progress["total_downloaded"] = len(self.progress["completed_ids"])
                    if (success_count + failure_count) % 5 == 0:
                        self._save_progress()
                        
                except Exception as e:
                    logger.error(f"Error processing retry result: {str(e)}")
        
        # Final progress update
        self.progress["total_downloaded"] = len(self.progress["completed_ids"])
        self._save_progress()
        
        result = {
            "retried": len(failed_ids),
            "successful": success_count,
            "still_failing": failure_count
        }
        
        logger.info(f"Retry completed: {success_count} successful, {failure_count} still failing")
        return result
    
    def get_progress_summary(self) -> Dict[str, Any]:
        """Get a summary of the current download progress."""
        if self.progress["total_found"] > 0:
            progress_percentage = (self.progress["total_downloaded"] / self.progress["total_found"]) * 100
        else:
            progress_percentage = 0
        
        # Calculate elapsed time
        start_time = datetime.fromisoformat(self.progress["start_time"])
        elapsed_seconds = (datetime.now() - start_time).total_seconds()
        
        # Calculate ETA if we have enough data
        eta_seconds = None
        if progress_percentage > 0:
            rate = self.progress["total_downloaded"] / elapsed_seconds  # downloads per second
            remaining = self.progress["total_found"] - self.progress["total_downloaded"]
            if rate > 0:
                eta_seconds = remaining / rate
        
        # Format time values
        def format_time(seconds):
            if seconds is None:
                return "Unknown"
            
            hours, remainder = divmod(int(seconds), 3600)
            minutes, seconds = divmod(remainder, 60)
            if hours > 0:
                return f"{hours}h {minutes}m {seconds}s"
            elif minutes > 0:
                return f"{minutes}m {seconds}s"
            else:
                return f"{seconds}s"
        
        return {
            "total_found": self.progress["total_found"],
            "downloaded": self.progress["total_downloaded"],
            "failed": len(self.progress["failed_ids"]),
            "progress_percentage": progress_percentage,
            "elapsed_time": format_time(elapsed_seconds),
            "estimated_time_remaining": format_time(eta_seconds),
            "last_page_processed": self.progress["last_page"],
            "start_time": self.progress["start_time"],
            "last_updated": self.progress["last_updated"]
        }
    
    def reset_progress(self):
        """Reset the download progress tracking."""
        confirm = input("This will reset all download progress tracking. Type 'yes' to confirm: ")
        if confirm.lower() != 'yes':
            print("Reset canceled.")
            return
        
        self.progress = {
            "total_found": 0,
            "total_downloaded": 0,
            "last_page": 0,
            "completed_ids": [],
            "failed_ids": [],
            "start_time": datetime.now().isoformat(),
            "last_updated": datetime.now().isoformat()
        }
        self._save_progress()
        logger.info("Download progress has been reset")


# CLI functionality
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Bulk CSR Downloader for EMA API")
    subparsers = parser.add_subparsers(dest="command", help="Command to execute")
    
    # Download command
    download_parser = subparsers.add_parser("download", help="Start or resume bulk download")
    download_parser.add_argument("--therapeutic-area", help="Filter by therapeutic area")
    download_parser.add_argument("--limit", type=int, help="Maximum number of reports to download")
    download_parser.add_argument("--batch-size", type=int, default=DEFAULT_BATCH_SIZE, help="Number of results per page")
    download_parser.add_argument("--workers", type=int, default=MAX_WORKERS, help="Maximum number of parallel downloads")
    download_parser.add_argument("--target-dir", default=DOWNLOAD_DIR, help="Directory to save the files")
    
    # Retry command
    retry_parser = subparsers.add_parser("retry", help="Retry failed downloads")
    retry_parser.add_argument("--workers", type=int, default=MAX_WORKERS, help="Maximum number of parallel downloads")
    retry_parser.add_argument("--target-dir", default=DOWNLOAD_DIR, help="Directory to save the files")
    
    # Status command
    status_parser = subparsers.add_parser("status", help="Show download progress")
    
    # Reset command
    reset_parser = subparsers.add_parser("reset", help="Reset download progress tracking")
    
    args = parser.parse_args()
    
    if args.command == "download":
        downloader = BulkDownloader(target_dir=args.target_dir)
        result = downloader.bulk_download(
            therapeutic_area=args.therapeutic_area,
            limit=args.limit,
            batch_size=args.batch_size,
            max_workers=args.workers
        )
        print(json.dumps(result, indent=2))
    
    elif args.command == "retry":
        downloader = BulkDownloader(target_dir=args.target_dir)
        result = downloader.retry_failed(max_workers=args.workers)
        print(json.dumps(result, indent=2))
    
    elif args.command == "status":
        downloader = BulkDownloader()
        summary = downloader.get_progress_summary()
        print("Download Progress Summary:")
        print(f"Total CSRs found: {summary['total_found']}")
        print(f"Downloaded: {summary['downloaded']} ({summary['progress_percentage']:.1f}%)")
        print(f"Failed: {summary['failed']}")
        print(f"Elapsed time: {summary['elapsed_time']}")
        print(f"Estimated time remaining: {summary['estimated_time_remaining']}")
        print(f"Last page processed: {summary['last_page_processed']}")
        print(f"Started: {summary['start_time']}")
        print(f"Last updated: {summary['last_updated']}")
    
    elif args.command == "reset":
        downloader = BulkDownloader()
        downloader.reset_progress()
    
    else:
        parser.print_help()