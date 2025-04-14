#!/usr/bin/env python3
"""
Unified CSR Downloader
--------------------
This script provides a unified interface for downloading Clinical Study Reports (CSRs)
from multiple sources and importing them into the database.

Supported sources:
- FDA (via Drugs@FDA API and web scraping)
- EMA (via web scraping)
- PDF processing from attached_assets directory
"""

import os
import sys
import time
import argparse
import logging
import json
import sqlite3
from typing import Dict, List, Any, Optional, Tuple
import importlib.util

# Constants
LOG_FILE = "unified_csr_downloader.log"
PROGRESS_FILE = "unified_download_progress.json"
SOURCES = ["FDA", "EMA", "PDF"]
DEFAULT_BATCH_SIZE = 10

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(LOG_FILE)
    ]
)
logger = logging.getLogger("unified-csr-downloader")

def load_progress() -> Dict[str, Any]:
    """Load download progress from file"""
    if os.path.exists(PROGRESS_FILE):
        try:
            with open(PROGRESS_FILE, 'r') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error loading progress file: {e}")
    
    # Default progress data
    return {
        "last_run": None,
        "sources": {
            "FDA": {
                "downloaded": 0,
                "imported": 0,
                "last_search_term": None,
                "last_search_skip": 0
            },
            "EMA": {
                "downloaded": 0,
                "imported": 0,
                "last_search_term": None,
                "last_search_page": 0
            },
            "PDF": {
                "processed": 0,
                "imported": 0
            }
        }
    }

def save_progress(progress: Dict[str, Any]):
    """Save download progress to file"""
    # Update last run time
    progress["last_run"] = time.strftime("%Y-%m-%d %H:%M:%S")
    
    try:
        with open(PROGRESS_FILE, 'w') as f:
            json.dump(progress, f, indent=2)
    except Exception as e:
        logger.error(f"Error saving progress file: {e}")

def import_fda_module():
    """Import the FDA CSR downloader module"""
    spec = importlib.util.spec_from_file_location("download_fda_csrs", "download_fda_csrs.py")
    if not spec or not spec.loader:
        return None
    
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module

def import_ema_web_module():
    """Import the EMA web downloader module"""
    spec = importlib.util.spec_from_file_location("download_ema_web", "download_ema_web.py")
    if not spec or not spec.loader:
        return None
    
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module

def import_ema_bulk_module():
    """Import the EMA bulk downloader module"""
    spec = importlib.util.spec_from_file_location("download_ema_bulk", "download_ema_bulk.py")
    if not spec or not spec.loader:
        return None
    
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module

def import_pdf_module():
    """Import the PDF to CSR import module"""
    spec = importlib.util.spec_from_file_location("batch_process_pdfs", "batch_process_pdfs.py")
    if not spec or not spec.loader:
        return None
    
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module

def download_from_fda(batch_size: int = DEFAULT_BATCH_SIZE, limit: Optional[int] = None) -> Dict[str, Any]:
    """Download CSRs from FDA"""
    # Import FDA module
    fda_module = import_fda_module()
    if not fda_module:
        logger.error("Failed to import FDA downloader module")
        return {"status": "error", "message": "Failed to import FDA downloader module"}
    
    logger.info("Starting FDA CSR download")
    
    # Default search terms
    search_terms = [
        "clinical trial", "clinical study", "phase 3", "phase III",
        "oncology", "cancer", "diabetes", "hypertension", "depression",
        "cardiovascular", "arthritis", "asthma", "COPD", "Alzheimer",
        "psoriasis", "multiple sclerosis", "HIV", "hepatitis"
    ]
    
    # Create downloader
    downloader = fda_module.FdaCsrDownloader()
    
    # Search for drug approvals
    result = downloader.search_and_process(
        search_terms=search_terms,
        limit=batch_size,
        total_limit=limit
    )
    
    # Download pending documents
    download_result = downloader.download_pending_documents(limit=batch_size)
    
    # Combine results
    result.update(download_result)
    
    return result

def download_from_ema_web(batch_size: int = DEFAULT_BATCH_SIZE, limit: Optional[int] = None) -> Dict[str, Any]:
    """Download CSRs from EMA via web scraping"""
    # Import EMA web module
    ema_web_module = import_ema_web_module()
    if not ema_web_module:
        logger.error("Failed to import EMA web downloader module")
        return {"status": "error", "message": "Failed to import EMA web downloader module"}
    
    logger.info("Starting EMA web CSR download")
    
    # Create downloader
    downloader = ema_web_module.EmaWebDownloader()
    
    # Default search terms
    search_terms = [
        "clinical trial", "clinical study", "phase 3", "phase III",
        "oncology", "cancer", "diabetes", "hypertension", "depression",
        "cardiovascular", "arthritis", "asthma", "COPD", "Alzheimer",
        "psoriasis", "multiple sclerosis", "HIV", "hepatitis"
    ]
    
    # Search for reports
    results = {"total_found": 0, "downloaded": 0, "failed": 0}
    
    for term in search_terms:
        term_results = downloader.search_and_download_reports(
            search_term=term,
            max_pages=1,
            limit=batch_size,
            download=True
        )
        
        if term_results.get("status") == "success":
            results["total_found"] += term_results.get("total_found", 0)
            results["downloaded"] += term_results.get("downloaded", 0)
            results["failed"] += term_results.get("failed", 0)
        
        # Check if we've reached the limit
        if limit and results["downloaded"] >= limit:
            break
    
    return results

def download_from_ema_bulk(batch_size: int = DEFAULT_BATCH_SIZE, limit: Optional[int] = None) -> Dict[str, Any]:
    """Download CSRs from EMA via bulk API"""
    # Import EMA bulk module
    ema_bulk_module = import_ema_bulk_module()
    if not ema_bulk_module:
        logger.error("Failed to import EMA bulk downloader module")
        return {"status": "error", "message": "Failed to import EMA bulk downloader module"}
    
    logger.info("Starting EMA bulk CSR download")
    
    # Create downloader
    downloader = ema_bulk_module.BulkDownloader()
    
    # Therapeutic areas to search
    therapeutic_areas = [
        "Oncology", "Cardiovascular", "Neurology",
        "Infectious Disease", "Immunology", "Endocrinology",
        "Respiratory", "Dermatology", "Gastroenterology",
        "Hematology", "Rheumatology", "Nephrology",
        "Ophthalmology", "Psychiatry", "Urology"
    ]
    
    combined_results = {"downloaded": 0, "skipped": 0, "failed": 0}
    
    # Try to get a valid token
    try:
        token = downloader.get_token()
        if not token:
            logger.error("Failed to get valid EMA API token")
            return {"status": "error", "message": "Failed to get valid EMA API token"}
    except Exception as e:
        logger.error(f"Error getting EMA API token: {e}")
        return {"status": "error", "message": f"Error getting EMA API token: {e}"}
    
    # Download for each therapeutic area
    for area in therapeutic_areas:
        try:
            results = downloader.bulk_download(
                therapeutic_area=area,
                limit=min(batch_size, limit) if limit else batch_size,
                batch_size=20,
                max_workers=2
            )
            
            # Update combined results
            combined_results["downloaded"] += results.get("downloaded", 0)
            combined_results["skipped"] += results.get("skipped", 0)
            combined_results["failed"] += results.get("failed", 0)
            
            # Check if we've reached the limit
            if limit and combined_results["downloaded"] >= limit:
                break
        except Exception as e:
            logger.error(f"Error downloading CSRs for {area}: {e}")
    
    return combined_results

def process_pdf_files(batch_size: int = DEFAULT_BATCH_SIZE, limit: Optional[int] = None) -> Dict[str, Any]:
    """Process PDF files in attached_assets directory"""
    # Import PDF module
    pdf_module = import_pdf_module()
    if not pdf_module:
        logger.error("Failed to import PDF processor module")
        return {"status": "error", "message": "Failed to import PDF processor module"}
    
    logger.info("Starting PDF file processing")
    
    # Process directory
    summary = pdf_module.batch_process_directory(
        directory="attached_assets",
        max_workers=min(2, batch_size),
        limit=limit
    )
    
    return summary

def download_from_multiple_sources(
    sources: List[str] = SOURCES,
    batch_size: int = DEFAULT_BATCH_SIZE,
    limit: Optional[int] = None
) -> Dict[str, Any]:
    """Download CSRs from multiple sources"""
    # Load progress
    progress = load_progress()
    
    results = {}
    
    # Process each source
    for source in sources:
        source_limit = limit
        
        logger.info(f"Processing source: {source}")
        
        if source == "FDA":
            result = download_from_fda(batch_size=batch_size, limit=source_limit)
            results["FDA"] = result
            
            # Update progress
            if "downloaded" in result:
                progress["sources"]["FDA"]["downloaded"] += result["downloaded"]
            if "applications_with_csrs" in result:
                progress["sources"]["FDA"]["imported"] += result["applications_with_csrs"]
        
        elif source == "EMA":
            # Try bulk first, fall back to web if it fails
            try:
                result = download_from_ema_bulk(batch_size=batch_size, limit=source_limit)
                if result.get("status") == "error" or result.get("downloaded", 0) == 0:
                    logger.warning("EMA bulk download failed or found no results, trying web download")
                    result = download_from_ema_web(batch_size=batch_size, limit=source_limit)
            except Exception as e:
                logger.warning(f"EMA bulk download failed: {e}, trying web download")
                result = download_from_ema_web(batch_size=batch_size, limit=source_limit)
            
            results["EMA"] = result
            
            # Update progress
            if "downloaded" in result:
                progress["sources"]["EMA"]["downloaded"] += result["downloaded"]
        
        elif source == "PDF":
            result = process_pdf_files(batch_size=batch_size, limit=source_limit)
            results["PDF"] = result
            
            # Update progress
            if "processed" in result:
                progress["sources"]["PDF"]["processed"] += result["processed"]
            if "successful" in result:
                progress["sources"]["PDF"]["imported"] += result["successful"]
    
    # Save progress
    save_progress(progress)
    
    return results

def get_status() -> Dict[str, Any]:
    """Get the current status of CSR downloads"""
    status = {
        "progress": load_progress(),
        "sources": {}
    }
    
    # Check FDA status
    try:
        fda_module = import_fda_module()
        if fda_module:
            downloader = fda_module.FdaCsrDownloader()
            status["sources"]["FDA"] = downloader.get_status()
    except Exception as e:
        logger.error(f"Error getting FDA status: {e}")
        status["sources"]["FDA"] = {"error": str(e)}
    
    # Check EMA web status
    try:
        ema_web_module = import_ema_web_module()
        if ema_web_module:
            downloader = ema_web_module.EmaWebDownloader()
            status["sources"]["EMA_web"] = downloader.get_status()
    except Exception as e:
        logger.error(f"Error getting EMA web status: {e}")
        status["sources"]["EMA_web"] = {"error": str(e)}
    
    # Check PDF status
    try:
        from check_csr_status import check_csr_database, check_pdf_directories
        status["sources"]["CSR_database"] = check_csr_database()
        status["sources"]["PDF_directories"] = check_pdf_directories()
    except Exception as e:
        logger.error(f"Error getting CSR database status: {e}")
        status["sources"]["CSR_database"] = {"error": str(e)}
    
    return status

def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(description="Unified CSR Downloader")
    parser.add_argument("-s", "--sources", nargs="+", choices=SOURCES, default=SOURCES, help="Sources to download from")
    parser.add_argument("-b", "--batch-size", type=int, default=DEFAULT_BATCH_SIZE, help="Batch size for each source")
    parser.add_argument("-l", "--limit", type=int, help="Limit the number of CSRs to download per source")
    parser.add_argument("--status", action="store_true", help="Show the current status and exit")
    parser.add_argument("--reset", action="store_true", help="Reset progress and start from scratch")
    args = parser.parse_args()
    
    # Reset progress if requested
    if args.reset and os.path.exists(PROGRESS_FILE):
        os.remove(PROGRESS_FILE)
        logger.info("Progress reset, starting from scratch")
    
    # Show status if requested
    if args.status:
        status = get_status()
        
        print("\nUnified CSR Downloader Status:")
        print("=============================")
        
        # Print progress
        progress = status["progress"]
        print("\nDownload Progress:")
        print(f"Last Run: {progress.get('last_run', 'Never')}")
        
        for source, stats in progress.get("sources", {}).items():
            print(f"\n{source}:")
            for key, value in stats.items():
                print(f"  {key}: {value}")
        
        # Print FDA status
        if "FDA" in status["sources"]:
            fda_status = status["sources"]["FDA"]
            print("\nFDA Status:")
            print(f"Total Applications: {fda_status.get('total_applications', 0)}")
            print(f"Applications with CSRs: {fda_status.get('applications_with_csrs', 0)}")
            
            download_status = fda_status.get("download_status", {})
            print("Download Status:")
            print(f"  Downloaded: {download_status.get('downloaded', 0)}")
            print(f"  Pending: {download_status.get('pending', 0)}")
            print(f"  Failed: {download_status.get('failed', 0)}")
        
        # Print EMA web status
        if "EMA_web" in status["sources"]:
            ema_status = status["sources"]["EMA_web"]
            print("\nEMA Web Status:")
            print(f"Total Reports: {ema_status.get('total_reports', 0)}")
            print(f"Downloaded: {ema_status.get('downloaded', 0)}")
            print(f"Pending: {ema_status.get('pending', 0)}")
        
        # Print CSR database status
        if "CSR_database" in status["sources"]:
            db_status = status["sources"]["CSR_database"]
            print("\nCSR Database Status:")
            print(f"Total CSRs: {db_status.get('count', 0)}")
            print(f"CSR Details: {db_status.get('details_count', 0)}")
            
            if db_status.get("therapeutic_areas"):
                print("\nTherapeutic Areas:")
                for area, count in db_status.get("therapeutic_areas", {}).items():
                    print(f"  {area}: {count}")
        
        # Print PDF directories status
        if "PDF_directories" in status["sources"]:
            pdf_status = status["sources"]["PDF_directories"]
            print("\nPDF Directories:")
            print(f"Attached Assets: {pdf_status.get('attached_assets', 0)} PDFs")
            print(f"Downloaded CSRs: {pdf_status.get('downloaded_csrs', {}).get('total', 0)} PDFs")
        
        return 0
    
    # Download from selected sources
    results = download_from_multiple_sources(
        sources=args.sources,
        batch_size=args.batch_size,
        limit=args.limit
    )
    
    # Print results
    print("\nDownload Results:")
    print("================")
    
    for source, result in results.items():
        print(f"\n{source}:")
        for key, value in result.items():
            print(f"  {key}: {value}")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())