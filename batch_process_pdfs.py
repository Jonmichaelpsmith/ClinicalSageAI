#!/usr/bin/env python3
"""
Batch PDF Processing for CSR Import
----------------------------------
This script processes all PDF files in the attached_assets directory
to import them as CSRs into the database.
"""

import os
import sys
import time
import argparse
import logging
import json
import sqlite3
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Dict, List, Any
from import_pdfs_to_csr import import_pdf_to_csr

# Constants
LOG_FILE = "batch_pdf_import.log"
MAX_WORKERS = 2  # Reduced to avoid memory issues
ATTACHED_ASSETS_DIR = "attached_assets"
DOWNLOADED_CSRS_DIR = "downloaded_csrs"
PROGRESS_FILE = "pdf_import_progress.json"

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(LOG_FILE)
    ]
)
logger = logging.getLogger("batch-pdf-import")

def load_progress() -> Dict[str, Any]:
    """Load import progress from file"""
    if os.path.exists(PROGRESS_FILE):
        try:
            with open(PROGRESS_FILE, 'r') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error loading progress file: {e}")
    
    # Default progress data
    return {
        "processed_files": [],
        "successful": [],
        "failed": [],
        "last_run": None
    }

def save_progress(progress: Dict[str, Any]):
    """Save import progress to file"""
    # Update last run time
    progress["last_run"] = time.strftime("%Y-%m-%d %H:%M:%S")
    
    try:
        with open(PROGRESS_FILE, 'w') as f:
            json.dump(progress, f, indent=2)
    except Exception as e:
        logger.error(f"Error saving progress file: {e}")

def find_pdf_files(directory: str) -> List[str]:
    """Find all PDF files in a directory"""
    pdf_files = []
    
    if not os.path.isdir(directory):
        logger.error(f"Directory does not exist: {directory}")
        return pdf_files
    
    for root, _, files in os.walk(directory):
        for file in files:
            if file.lower().endswith('.pdf'):
                pdf_files.append(os.path.join(root, file))
    
    return pdf_files

def process_pdf_file(pdf_path: str, progress: Dict[str, Any]) -> Dict[str, Any]:
    """Process a single PDF file"""
    result = {
        "path": pdf_path,
        "success": False,
        "error": None
    }
    
    # Skip if already processed successfully
    if pdf_path in progress["successful"]:
        logger.info(f"Skipping already processed file: {pdf_path}")
        result["success"] = True
        return result
    
    # Try to process the file
    try:
        success = import_pdf_to_csr(pdf_path)
        result["success"] = success
        
        if success:
            if pdf_path not in progress["successful"]:
                progress["successful"].append(pdf_path)
            
            # Remove from failed list if it was there
            if pdf_path in progress["failed"]:
                progress["failed"].remove(pdf_path)
        else:
            if pdf_path not in progress["failed"]:
                progress["failed"].append(pdf_path)
                result["error"] = "Import failed (see log for details)"
    except Exception as e:
        logger.error(f"Error processing PDF {pdf_path}: {e}")
        result["success"] = False
        result["error"] = str(e)
        
        if pdf_path not in progress["failed"]:
            progress["failed"].append(pdf_path)
    
    # Mark as processed
    if pdf_path not in progress["processed_files"]:
        progress["processed_files"].append(pdf_path)
    
    # Save progress after each file
    save_progress(progress)
    
    return result

def batch_process_directory(directory: str, max_workers: int = MAX_WORKERS, limit: int = None) -> Dict[str, Any]:
    """Process all PDF files in a directory"""
    # Load progress
    progress = load_progress()
    
    # Find PDF files
    pdf_files = find_pdf_files(directory)
    
    if limit:
        # Filter files that haven't been successfully processed
        unprocessed_files = [f for f in pdf_files if f not in progress["successful"]]
        pdf_files = unprocessed_files[:limit]
    
    if not pdf_files:
        logger.warning(f"No PDF files found in {directory}")
        return {
            "total": 0,
            "processed": 0,
            "successful": 0,
            "failed": 0
        }
    
    logger.info(f"Found {len(pdf_files)} PDF files to process")
    
    # Process files
    results = []
    
    # Use ThreadPoolExecutor for parallel processing
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        # Submit all tasks
        future_to_pdf = {
            executor.submit(process_pdf_file, pdf, progress): pdf
            for pdf in pdf_files
        }
        
        # Process completed tasks
        for i, future in enumerate(as_completed(future_to_pdf)):
            pdf = future_to_pdf[future]
            
            try:
                result = future.result()
                results.append(result)
                
                # Log progress
                logger.info(f"Progress: {i+1}/{len(pdf_files)} - {pdf} - {'Success' if result['success'] else 'Failed'}")
            except Exception as e:
                logger.error(f"Error processing {pdf}: {e}")
                results.append({
                    "path": pdf,
                    "success": False,
                    "error": str(e)
                })
                
                # Update progress
                if pdf not in progress["failed"]:
                    progress["failed"].append(pdf)
                
                if pdf not in progress["processed_files"]:
                    progress["processed_files"].append(pdf)
            
            # Save progress periodically
            if (i + 1) % 5 == 0:
                save_progress(progress)
    
    # Final save
    save_progress(progress)
    
    # Generate summary
    summary = {
        "total": len(pdf_files),
        "processed": len(results),
        "successful": sum(1 for r in results if r["success"]),
        "failed": sum(1 for r in results if not r["success"])
    }
    
    return summary

def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(description="Batch process PDF files to import as CSRs")
    parser.add_argument("-d", "--directory", default=ATTACHED_ASSETS_DIR, help="Directory containing PDF files")
    parser.add_argument("-w", "--workers", type=int, default=MAX_WORKERS, help="Maximum number of worker threads")
    parser.add_argument("-l", "--limit", type=int, help="Limit the number of files to process")
    parser.add_argument("--reset", action="store_true", help="Reset progress and process all files")
    args = parser.parse_args()
    
    # Reset progress if requested
    if args.reset and os.path.exists(PROGRESS_FILE):
        os.remove(PROGRESS_FILE)
        logger.info("Progress reset, processing all files")
    
    # Process directory
    summary = batch_process_directory(
        directory=args.directory,
        max_workers=args.workers,
        limit=args.limit
    )
    
    # Display summary
    print("\nBatch Processing Summary:")
    print("========================")
    print(f"Total files: {summary['total']}")
    print(f"Processed: {summary['processed']}")
    print(f"Successful: {summary['successful']}")
    print(f"Failed: {summary['failed']}")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())