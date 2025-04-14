#!/usr/bin/env python3
"""
EMA CSR Bulk Downloader
-----------------------
A straightforward script to download Clinical Study Reports from the EMA API.
"""

import os
import sys
import json
import time
import logging
import requests
import sqlite3
import argparse
from datetime import datetime, timedelta

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger("ema-downloader")

# Constants
DOWNLOAD_DIR = "downloaded_csrs"
API_URL = "https://spor-prod-bk.azure-api.net/upd/api/v3"
TOKEN_URL = "https://login.microsoftonline.com/bc9dc15c-61bc-4f03-b60b-e5b6d8922839/oauth2/v2.0/token"
API_SCOPE = "api://euema.onmicrosoft.com/upd-apim-secured/.default"
DB_PATH = "ema_csr_database.db"

def setup_database():
    """Create the database if it doesn't exist"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Create tables
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS csr_reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        report_id TEXT UNIQUE,
        title TEXT,
        procedure_number TEXT,
        scientific_name TEXT,
        therapeutic_area TEXT,
        publication_date TEXT,
        document_type TEXT,
        download_url TEXT,
        file_path TEXT,
        downloaded INTEGER DEFAULT 0,
        download_date TEXT,
        metadata TEXT,
        processed INTEGER DEFAULT 0
    )
    ''')
    
    # Create indexes
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_report_id ON csr_reports(report_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_therapeutic_area ON csr_reports(therapeutic_area)")
    
    conn.commit()
    conn.close()
    logger.info(f"Database initialized at {DB_PATH}")

def get_token():
    """Get an access token for the EMA API"""
    logger.info("Getting access token...")
    
    # Check environment variables
    client_id = os.environ.get("EMA_CLIENT_ID")
    client_secret = os.environ.get("EMA_CLIENT_SECRET")
    
    if not client_id or not client_secret:
        logger.error("EMA_CLIENT_ID and EMA_CLIENT_SECRET must be set")
        sys.exit(1)
    
    # Request token
    data = {
        'client_id': client_id,
        'client_secret': client_secret,
        'grant_type': 'client_credentials',
        'scope': API_SCOPE
    }
    
    try:
        response = requests.post(TOKEN_URL, data=data)
        response.raise_for_status()
        
        token_data = response.json()
        access_token = token_data.get('access_token')
        
        if not access_token:
            logger.error("No access token in response")
            sys.exit(1)
            
        # Just show a preview of the token for verification
        token_preview = access_token[:15] + "..." if len(access_token) > 15 else access_token
        logger.info(f"Received access token: {token_preview}")
        
        return access_token
    
    except requests.RequestException as e:
        logger.error(f"Failed to get access token: {str(e)}")
        if hasattr(e, 'response') and e.response:
            logger.error(f"Response: {e.response.text}")
        sys.exit(1)

def get_reports(token, therapeutic_area=None, page=1, page_size=50):
    """Get a list of CSR reports"""
    logger.info(f"Getting reports page {page} (page_size={page_size})...")
    
    # Build the request
    url = f"{API_URL}/clinical-reports"
    headers = {
        'Authorization': f'Bearer {token}',
        'Accept': 'application/json'
    }
    
    params = {
        'page': page,
        'pageSize': page_size
    }
    
    if therapeutic_area:
        params['therapeuticArea'] = therapeutic_area
    
    try:
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        
        data = response.json()
        items = data.get('items', [])
        total = data.get('total', 0)
        
        logger.info(f"Retrieved {len(items)} items (total: {total})")
        
        return {
            'items': items,
            'total': total,
            'has_more': len(items) == page_size and len(items) + (page - 1) * page_size < total
        }
    
    except requests.RequestException as e:
        logger.error(f"Failed to get reports: {str(e)}")
        if hasattr(e, 'response') and e.response:
            logger.error(f"Response: {e.response.text}")
        return {'items': [], 'total': 0, 'has_more': False}

def download_report(token, report, download_dir):
    """Download a single CSR report"""
    report_id = report.get('id')
    title = report.get('title', 'Untitled')
    
    if not report_id:
        logger.error("Report missing ID")
        return False, None
    
    logger.info(f"Downloading report {report_id}: {title}")
    
    # Check if already downloaded
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute("SELECT file_path, downloaded FROM csr_reports WHERE report_id = ?", (report_id,))
    result = cursor.fetchone()
    
    if result and result['downloaded'] and os.path.exists(result['file_path']):
        logger.info(f"Report {report_id} already downloaded to {result['file_path']}")
        conn.close()
        return True, result['file_path']
    
    # Get report details
    report_url = f"{API_URL}/clinical-reports/{report_id}"
    headers = {
        'Authorization': f'Bearer {token}',
        'Accept': 'application/json'
    }
    
    try:
        response = requests.get(report_url, headers=headers)
        response.raise_for_status()
        
        report_data = response.json()
        download_url = report_data.get('downloadUrl')
        
        if not download_url:
            logger.error(f"No download URL for report {report_id}")
            conn.close()
            return False, None
        
        # Create file name
        safe_title = "".join([c if c.isalnum() or c in ' -_.' else '_' for c in title])
        file_name = f"{safe_title[:100]}_{report_id}.pdf"
        file_path = os.path.join(download_dir, file_name)
        
        # Download file
        logger.info(f"Downloading from {download_url}")
        
        download_headers = {
            'Authorization': f'Bearer {token}'
        }
        
        download_response = requests.get(download_url, headers=download_headers, stream=True)
        download_response.raise_for_status()
        
        # Check for content-disposition header
        if 'content-disposition' in download_response.headers:
            content_disp = download_response.headers['content-disposition']
            if 'filename=' in content_disp:
                suggested_name = content_disp.split('filename=')[1].strip('"\'')
                if suggested_name:
                    file_path = os.path.join(download_dir, suggested_name)
        
        # Save the file
        with open(file_path, 'wb') as f:
            for chunk in download_response.iter_content(chunk_size=8192):
                f.write(chunk)
        
        # Update database
        now = datetime.now().isoformat()
        cursor.execute(
            """
            INSERT OR REPLACE INTO csr_reports 
            (report_id, title, procedure_number, scientific_name, therapeutic_area, 
            publication_date, document_type, download_url, file_path, downloaded, download_date, metadata)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
            """,
            (
                report_id,
                report_data.get('title'),
                report_data.get('procedureNumber'),
                report_data.get('scientificName'),
                report_data.get('therapeuticArea'),
                report_data.get('publicationDate'),
                report_data.get('documentType'),
                download_url,
                file_path,
                now,
                json.dumps(report_data)
            )
        )
        conn.commit()
        
        logger.info(f"Successfully downloaded {report_id} to {file_path}")
        conn.close()
        return True, file_path
        
    except Exception as e:
        logger.error(f"Error downloading report {report_id}: {str(e)}")
        conn.close()
        return False, None

def main():
    """Main function"""
    parser = argparse.ArgumentParser(description="Download CSR reports from EMA API")
    parser.add_argument("--therapeutic-area", help="Filter by therapeutic area")
    parser.add_argument("--limit", type=int, default=10, help="Maximum number of reports to download")
    parser.add_argument("--output-dir", default=DOWNLOAD_DIR, help="Directory to save downloads")
    parser.add_argument("--test-auth", action="store_true", help="Just test authentication")
    parser.add_argument("--list", action="store_true", help="Just list reports without downloading")
    parser.add_argument("--show-stats", action="store_true", help="Show download statistics")
    
    args = parser.parse_args()
    
    # Create output directory
    os.makedirs(args.output_dir, exist_ok=True)
    
    # Set up database
    setup_database()
    
    # Get access token
    token = get_token()
    
    if args.test_auth:
        logger.info("Authentication successful")
        return
    
    if args.show_stats:
        # Show download statistics
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute("SELECT COUNT(*) as count FROM csr_reports")
        total = cursor.fetchone()['count']
        
        cursor.execute("SELECT COUNT(*) as count FROM csr_reports WHERE downloaded = 1")
        downloaded = cursor.fetchone()['count']
        
        cursor.execute("SELECT therapeutic_area, COUNT(*) as count FROM csr_reports GROUP BY therapeutic_area ORDER BY count DESC")
        areas = cursor.fetchall()
        
        logger.info(f"Total reports: {total}")
        logger.info(f"Downloaded reports: {downloaded}")
        
        if areas:
            logger.info("Top therapeutic areas:")
            for area in areas[:5]:  # Show top 5
                if area['therapeutic_area']:
                    logger.info(f"  {area['therapeutic_area']}: {area['count']}")
        
        conn.close()
        return
    
    # Get reports
    page = 1
    reports = []
    has_more = True
    
    while has_more and (args.limit is None or len(reports) < args.limit):
        result = get_reports(token, args.therapeutic_area, page)
        reports.extend(result['items'])
        has_more = result['has_more']
        page += 1
        
        # Don't request more pages than needed
        if args.limit is not None and len(reports) >= args.limit:
            reports = reports[:args.limit]
            break
        
        # Avoid rate limiting
        if has_more:
            time.sleep(1)
    
    if args.list:
        logger.info(f"Found {len(reports)} reports:")
        for i, report in enumerate(reports, 1):
            logger.info(f"{i}. {report.get('id')}: {report.get('title', 'Untitled')}")
        return
    
    # Download reports
    successful = 0
    for i, report in enumerate(reports, 1):
        logger.info(f"Processing {i}/{len(reports)}")
        
        success, path = download_report(token, report, args.output_dir)
        if success:
            successful += 1
            logger.info(f"Progress: {successful}/{len(reports)} downloaded")
        
        # Small delay to avoid overwhelming the API
        time.sleep(1)
    
    logger.info(f"Download complete. Successfully downloaded {successful} out of {len(reports)} reports.")

if __name__ == "__main__":
    main()