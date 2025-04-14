#!/usr/bin/env python3
"""
EMA CSR Downloader
------------------
This script downloads Clinical Study Reports from the EMA API in bulk
and stores them in the database.

Usage:
    python download_ema_csrs.py [options]

Options:
    --limit <int>            Maximum number of CSRs to download (default: 5)
    --therapeutic-area <str> Filter by therapeutic area
    --procedure-number <str> Filter by procedure number
    --scientific-name <str>  Filter by scientific name
    --test-auth              Only test authentication
    --init                   Initialize the database if it doesn't exist
    --list                   List downloaded CSRs
    --batch                  Download in batch mode (many reports at once)
    --output <dir>           Directory to save reports (default: "downloaded_csrs")
"""

import os
import sys
import argparse
import sqlite3
from datetime import datetime
import time
import logging
import json
from typing import Dict, List, Optional, Any

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger("ema-downloader")

# Try to import the EMA API client
try:
    from ema_api import EmaApiClient, CSR_DATABASE
except ImportError:
    logger.error("Failed to import EMA API client. Make sure ema_api.py is in the same directory.")
    sys.exit(1)

def main():
    parser = argparse.ArgumentParser(description="Download Clinical Study Reports from EMA API")
    parser.add_argument("--limit", type=int, default=5, help="Maximum number of CSRs to download")
    parser.add_argument("--therapeutic-area", help="Filter by therapeutic area")
    parser.add_argument("--procedure-number", help="Filter by procedure number")
    parser.add_argument("--scientific-name", help="Filter by scientific name")
    parser.add_argument("--test-auth", action="store_true", help="Only test authentication")
    parser.add_argument("--init", action="store_true", help="Initialize the database if it doesn't exist")
    parser.add_argument("--list", action="store_true", help="List downloaded CSRs")
    parser.add_argument("--batch", action="store_true", help="Download in batch mode")
    parser.add_argument("--output", default="downloaded_csrs", help="Directory to save reports")
    
    args = parser.parse_args()
    
    # Check if required environment variables are set
    if not os.environ.get("EMA_CLIENT_ID") or not os.environ.get("EMA_CLIENT_SECRET"):
        logger.error("EMA_CLIENT_ID and EMA_CLIENT_SECRET environment variables must be set")
        sys.exit(1)
    
    # Create EMA API client
    client = EmaApiClient()
    
    # Initialize database if requested - use client's method
    if args.init:
        try:
            client._init_database()
            logger.info(f"Initialized database at {CSR_DATABASE}")
        except Exception as e:
            logger.error(f"Failed to initialize database: {str(e)}")
            sys.exit(1)
    
    # Test authentication if requested
    if args.test_auth:
        try:
            token = client.get_headers().get('Authorization', '').replace('Bearer ', '')
            token_preview = token[:15] + "..." if token else "None"
            logger.info(f"Authentication successful. Token: {token_preview}")
            return
        except Exception as e:
            logger.error(f"Authentication failed: {str(e)}")
            sys.exit(1)
    
    # List downloaded reports if requested
    if args.list:
        try:
            reports = client.list_downloaded_reports()
            logger.info(f"Found {len(reports)} downloaded reports:")
            for i, report in enumerate(reports, 1):
                logger.info(f"{i}. {report.get('report_id')}: {report.get('title')} ({report.get('download_date')})")
            return
        except Exception as e:
            logger.error(f"Failed to list reports: {str(e)}")
            sys.exit(1)
    
    # Download CSRs
    try:
        logger.info(f"Starting download of up to {args.limit} CSRs...")
        
        # Search for CSRs
        results = client.search_csr_reports(
            therapeutic_area=args.therapeutic_area,
            procedure_number=args.procedure_number,
            scientific_name=args.scientific_name,
            page=1,
            page_size=min(args.limit, 50)  # Cap at 50 items per page
        )
        
        reports = results.get('items', [])
        logger.info(f"Found {len(reports)} CSRs matching criteria")
        
        # Download each report
        downloaded = 0
        for i, report in enumerate(reports[:args.limit], 1):
            report_id = report.get('id')
            title = report.get('title', 'Untitled')
            
            if not report_id:
                logger.warning(f"Missing report ID in report {i}")
                continue
            
            logger.info(f"Downloading report {i}/{min(len(reports), args.limit)}: {title} ({report_id})")
            
            try:
                file_path = client.download_csr_report(report_id)
                logger.info(f"Successfully downloaded to {file_path}")
                downloaded += 1
                
                # Brief pause to avoid overwhelming the API
                time.sleep(1)
            except Exception as e:
                logger.error(f"Failed to download report {report_id}: {str(e)}")
        
        logger.info(f"Download complete. Downloaded {downloaded} CSRs.")
    
    except Exception as e:
        logger.error(f"Download failed: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()