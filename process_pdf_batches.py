#!/usr/bin/env python3
"""
Process PDF Batches
------------------
This script processes PDFs in batches to avoid timeouts.
"""

import os
import sys
import time
import subprocess
import logging
from typing import List

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger("pdf-batch-processor")

# Constants
PDF_SOURCE_DIR = "attached_assets"
BATCH_SIZE = 5  # Process 5 PDFs at a time
TOTAL_PDFS = 76  # From the previous run output

def process_batch(offset: int, limit: int) -> bool:
    """Process a batch of PDFs"""
    logger.info(f"Processing batch: offset={offset}, limit={limit}")
    
    cmd = [
        "python", "import_pdfs_to_csr.py",
        "--dir", PDF_SOURCE_DIR,
        "--offset", str(offset),
        "--limit", str(limit)
    ]
    
    try:
        result = subprocess.run(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            timeout=120  # 2 minutes timeout
        )
        
        if result.returncode == 0:
            logger.info(f"Batch completed successfully: {offset}-{offset+limit}")
            logger.info(result.stdout)
            return True
        else:
            logger.error(f"Batch failed: {offset}-{offset+limit}")
            logger.error(result.stderr)
            return False
            
    except subprocess.TimeoutExpired:
        logger.warning(f"Batch timed out: {offset}-{offset+limit}, but might have partially completed")
        return False
    except Exception as e:
        logger.error(f"Error processing batch {offset}-{offset+limit}: {e}")
        return False

def process_all_batches(start_offset: int = 0) -> None:
    """Process all PDFs in batches, with optional starting offset"""
    successful_batches = 0
    failed_batches = 0
    
    for offset in range(start_offset, TOTAL_PDFS, BATCH_SIZE):
        # Process this batch
        if process_batch(offset, BATCH_SIZE):
            successful_batches += 1
        else:
            failed_batches += 1
            
        # Add a delay between batches
        logger.info(f"Waiting 5 seconds before next batch...")
        time.sleep(5)
    
    logger.info(f"Batch processing complete.")
    logger.info(f"Successful batches: {successful_batches}")
    logger.info(f"Failed batches: {failed_batches}")

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Process PDFs in batches")
    parser.add_argument("--start", type=int, default=0, help="Start offset for processing")
    args = parser.parse_args()
    
    logger.info(f"Starting batch processing of PDFs from offset {args.start}")
    process_all_batches(start_offset=args.start)
    logger.info("Batch processing script finished")