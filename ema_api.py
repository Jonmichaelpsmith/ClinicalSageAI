"""
European Medicines Agency (EMA) API Client
------------------------------------------
This module provides functionality to authenticate with the EMA API
and download Clinical Study Reports (CSRs).
"""

import os
import requests
import json
import logging
from datetime import datetime, timedelta
import time
from typing import Dict, List, Optional, Tuple, Any, Union
import sqlite3

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('ema_api')

# Constants
TOKEN_ENDPOINT = "https://login.microsoftonline.com/bc9dc15c-61bc-4f03-b60b-e5b6d8922839/oauth2/v2.0/token"
API_SCOPE = "api://euema.onmicrosoft.com/upd-apim-secured/.default"
CSR_DATABASE = "ema_csr_database.db"
BASE_API_URL = "https://spor-prod-bk.azure-api.net/upd/api/v3"

def init_database():
    """Initialize the CSR reports database with the necessary tables"""
    conn = None
    try:
        conn = sqlite3.connect(CSR_DATABASE)
        cursor = conn.cursor()
        
        # Create the CSR reports table if it doesn't exist
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS csr_reports (
            report_id TEXT PRIMARY KEY,
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
            processed INTEGER DEFAULT 0,
            processed_date TEXT,
            embedding_id TEXT
        )
        """)
        
        # Create an index on the therapeutic area for faster filtering
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_therapeutic_area ON csr_reports(therapeutic_area)")
        
        # Create an index on the downloaded flag for faster filtering
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_downloaded ON csr_reports(downloaded)")
        
        # Create an index on the processed flag for faster filtering
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_processed ON csr_reports(processed)")
        
        conn.commit()
        logger.info(f"Database initialized at {CSR_DATABASE}")
        return True
    except Exception as e:
        logger.error(f"Failed to initialize database: {str(e)}")
        raise
    finally:
        if conn:
            conn.close()

# Client credentials from environment variables or directly from screenshots
CLIENT_ID = os.environ.get("EMA_CLIENT_ID", "e1f0c100-17f0-445d-8989-3e43cdc6e741")
CLIENT_SECRET = os.environ.get("EMA_CLIENT_SECRET", "AyX8Q~KS0HRcGDoAFw~6PnK3us5WUS8eWxLF8cav")

# Token storage
class TokenManager:
    """Manages OAuth tokens including retrieval, storage, and renewal."""
    
    def __init__(self):
        self.access_token = None
        self.expires_at = None
    
    def get_token(self) -> str:
        """
        Gets a valid access token, requesting a new one if necessary.
        
        Returns:
            str: A valid access token
        """
        # Check if we have a valid token
        if self.access_token and self.expires_at and datetime.now() < self.expires_at:
            logger.debug("Using existing valid token")
            return self.access_token
        
        # Otherwise, request a new token
        return self._request_new_token()
    
    def _request_new_token(self) -> str:
        """
        Requests a new access token from the EMA OAuth endpoint.
        
        Returns:
            str: A new access token
            
        Raises:
            Exception: If token retrieval fails
        """
        logger.info("Requesting new access token")
        
        data = {
            'client_id': CLIENT_ID,
            'client_secret': CLIENT_SECRET,
            'grant_type': 'client_credentials',
            'scope': API_SCOPE
        }
        
        response = requests.post(TOKEN_ENDPOINT, data=data)
        
        if response.status_code != 200:
            logger.error(f"Token request failed: {response.status_code} - {response.text}")
            raise Exception(f"Failed to get access token: {response.status_code} - {response.text}")
        
        token_data = response.json()
        self.access_token = token_data['access_token']
        
        # Set expiration time (subtract 5 minutes for safety margin)
        expires_in = int(token_data.get('expires_in', 3599))  # Default to ~1 hour if not provided
        self.expires_at = datetime.now() + timedelta(seconds=expires_in - 300)
        
        logger.info(f"New token obtained, expires at {self.expires_at}")
        return self.access_token


class EmaApiClient:
    """Client for interacting with the EMA API."""
    
    def __init__(self):
        self.token_manager = TokenManager()
        self._init_database()
    
    def _init_database(self):
        """Initialize the SQLite database to store CSR metadata."""
        conn = sqlite3.connect(CSR_DATABASE)
        cursor = conn.cursor()
        
        # Create tables if they don't exist
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
            downloaded BOOLEAN DEFAULT 0,
            download_date TEXT,
            metadata TEXT
        )
        ''')
        
        conn.commit()
        conn.close()
    
    def get_headers(self) -> Dict[str, str]:
        """
        Get authorization headers for API requests.
        
        Returns:
            Dict[str, str]: Headers including the authorization token
        """
        token = self.token_manager.get_token()
        return {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    
    def search_csr_reports(self, 
                         therapeutic_area: Optional[str] = None,
                         procedure_number: Optional[str] = None, 
                         scientific_name: Optional[str] = None,
                         page: int = 1,
                         page_size: int = 50) -> Dict[str, Any]:
        """
        Search for Clinical Study Reports based on filter criteria.
        
        Args:
            therapeutic_area: Filter by therapeutic area
            procedure_number: Filter by procedure number
            scientific_name: Filter by scientific name of the medication
            page: Page number for pagination
            page_size: Number of results per page
            
        Returns:
            Dict containing search results
        """
        # Use the BASE_API_URL constant
        base_url = f"{BASE_API_URL}/clinical-reports"
        
        # Build query parameters
        params = {
            'page': page,  # API expects string parameters
            'pageSize': page_size  # API expects string parameters
        }
        
        if therapeutic_area:
            params['therapeuticArea'] = therapeutic_area
        if procedure_number:
            params['procedureNumber'] = procedure_number
        if scientific_name:
            params['scientificName'] = scientific_name
        
        try:
            response = requests.get(base_url, headers=self.get_headers(), params=params)
            
            if response.status_code == 200:
                return response.json()
            elif response.status_code == 401:
                # Token might be expired despite our safety margin, force renewal
                logger.warning("Unauthorized. Clearing token and retrying.")
                self.token_manager.access_token = None
                self.token_manager.expires_at = None
                
                # Retry with fresh token
                response = requests.get(base_url, headers=self.get_headers(), params=params)
                if response.status_code == 200:
                    return response.json()
            
            # If we got here, there's an error we can't automatically recover from
            logger.error(f"API request failed: {response.status_code} - {response.text}")
            raise Exception(f"Failed to search CSR reports: {response.status_code} - {response.text}")
            
        except Exception as e:
            logger.error(f"Error searching CSR reports: {str(e)}")
            raise
    
    def download_csr_report(self, report_id: str, target_dir: str = "downloaded_csrs") -> str:
        """
        Download a specific CSR report.
        
        Args:
            report_id: The ID of the report to download
            target_dir: Directory to save the downloaded file
            
        Returns:
            str: Path to the downloaded file
        """
        # Ensure target directory exists
        os.makedirs(target_dir, exist_ok=True)
        
        # Get report metadata and download URL using BASE_API_URL
        report_url = f"{BASE_API_URL}/clinical-reports/{report_id}"
        
        conn = None
        try:
            # Check if we've already downloaded this report
            conn = sqlite3.connect(CSR_DATABASE)
            cursor = conn.cursor()
            cursor.execute("SELECT file_path, downloaded FROM csr_reports WHERE report_id = ?", (report_id,))
            result = cursor.fetchone()
            
            if result and result[1]:  # If downloaded is True
                file_path = result[0]
                if os.path.exists(file_path):
                    logger.info(f"Report {report_id} already downloaded to {file_path}")
                    return file_path
            
            # If not found or not downloaded, proceed to download
            response = requests.get(report_url, headers=self.get_headers())
            
            if response.status_code != 200:
                logger.error(f"Failed to get report details: {response.status_code} - {response.text}")
                raise Exception(f"Failed to get report details: {response.status_code} - {response.text}")
            
            report_details = response.json()
            download_url = report_details.get('downloadUrl')
            
            if not download_url:
                logger.error(f"No download URL found for report {report_id}")
                raise Exception(f"No download URL found for report {report_id}")
            
            # File name could be derived from report details or content-disposition header
            file_name = f"{report_id}.pdf"  # Default name
            if 'title' in report_details:
                # Create a safer filename from the title
                safe_title = "".join([c if c.isalnum() or c in ' -_.' else '_' for c in report_details['title']])
                file_name = f"{safe_title[:100]}_{report_id}.pdf"
            
            file_path = os.path.join(target_dir, file_name)
            
            # Download the file
            download_response = requests.get(download_url, headers=self.get_headers(), stream=True)
            
            if download_response.status_code != 200:
                logger.error(f"Failed to download report: {download_response.status_code} - {download_response.text}")
                raise Exception(f"Failed to download report: {download_response.status_code} - {download_response.text}")
            
            # If content-disposition header exists, use it to get filename
            if 'content-disposition' in download_response.headers:
                content_disp = download_response.headers['content-disposition']
                if 'filename=' in content_disp:
                    suggested_filename = content_disp.split('filename=')[1].strip('"\'')
                    if suggested_filename:
                        file_path = os.path.join(target_dir, suggested_filename)
            
            # Write the file
            with open(file_path, 'wb') as f:
                for chunk in download_response.iter_content(chunk_size=8192):
                    f.write(chunk)
            
            # Update database
            cursor.execute(
                """
                INSERT OR REPLACE INTO csr_reports 
                (report_id, title, procedure_number, scientific_name, therapeutic_area, 
                publication_date, document_type, download_url, file_path, downloaded, download_date, metadata)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
                """,
                (
                    report_id,
                    report_details.get('title'),
                    report_details.get('procedureNumber'),
                    report_details.get('scientificName'),
                    report_details.get('therapeuticArea'),
                    report_details.get('publicationDate'),
                    report_details.get('documentType'),
                    download_url,
                    file_path,
                    datetime.now().isoformat(),
                    json.dumps(report_details)
                )
            )
            conn.commit()
            
            logger.info(f"Successfully downloaded report {report_id} to {file_path}")
            return file_path
            
        except Exception as e:
            logger.error(f"Error downloading CSR report {report_id}: {str(e)}")
            raise
        finally:
            if conn:
                conn.close()
    
    def batch_download_reports(self, 
                             therapeutic_area: Optional[str] = None,
                             limit: int = 10,
                             target_dir: str = "downloaded_csrs") -> List[str]:
        """
        Search for and download multiple CSR reports based on criteria.
        
        Args:
            therapeutic_area: Filter by therapeutic area
            limit: Maximum number of reports to download
            target_dir: Directory to save downloaded files
            
        Returns:
            List[str]: Paths to downloaded files
        """
        downloaded_files = []
        page = 1
        page_size = min(limit, 50)  # Cap at 50 items per page
        
        while len(downloaded_files) < limit:
            try:
                # Search for reports
                search_results = self.search_csr_reports(
                    therapeutic_area=therapeutic_area,
                    page=page,
                    page_size=page_size
                )
                
                reports = search_results.get('items', [])
                if not reports:
                    logger.info("No more reports found")
                    break
                
                # Download each report
                for report in reports:
                    if len(downloaded_files) >= limit:
                        break
                    
                    report_id = report.get('id')
                    if not report_id:
                        logger.warning(f"Missing report ID in {report}")
                        continue
                    
                    try:
                        file_path = self.download_csr_report(report_id, target_dir)
                        downloaded_files.append(file_path)
                        logger.info(f"Downloaded {len(downloaded_files)}/{limit} reports")
                        
                        # Brief pause to avoid overwhelming the API
                        time.sleep(1)
                    except Exception as e:
                        logger.error(f"Error downloading report {report_id}: {str(e)}")
                
                # If we've processed all items on this page but need more
                if len(reports) < page_size:
                    break  # No more pages
                
                page += 1
                
            except Exception as e:
                logger.error(f"Error in batch download: {str(e)}")
                break
        
        return downloaded_files
    
    def list_downloaded_reports(self) -> List[Dict[str, Any]]:
        """
        List all reports that have been downloaded.
        
        Returns:
            List[Dict[str, Any]]: List of downloaded report metadata
        """
        conn = None
        try:
            conn = sqlite3.connect(CSR_DATABASE)
            conn.row_factory = sqlite3.Row  # Return rows as dictionaries
            cursor = conn.cursor()
            
            cursor.execute("""
                SELECT * FROM csr_reports 
                WHERE downloaded = 1
                ORDER BY download_date DESC
            """)
            
            reports = [dict(row) for row in cursor.fetchall()]
            return reports
        except Exception as e:
            logger.error(f"Error listing downloaded reports: {str(e)}")
            return []
        finally:
            if conn:
                conn.close()


# Simple CLI functionality if executed directly
if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="EMA API Client for downloading Clinical Study Reports")
    subparsers = parser.add_subparsers(dest="command", help="Command to execute")
    
    # Test connection command
    test_parser = subparsers.add_parser("test", help="Test the API connection")
    
    # Search command
    search_parser = subparsers.add_parser("search", help="Search for CSR reports")
    search_parser.add_argument("--therapeutic-area", help="Filter by therapeutic area")
    search_parser.add_argument("--procedure-number", help="Filter by procedure number")
    search_parser.add_argument("--scientific-name", help="Filter by scientific name")
    search_parser.add_argument("--page", type=int, default=1, help="Page number")
    search_parser.add_argument("--page-size", type=int, default=10, help="Results per page")
    
    # Download command
    download_parser = subparsers.add_parser("download", help="Download a specific CSR report")
    download_parser.add_argument("report_id", help="ID of the report to download")
    download_parser.add_argument("--target-dir", default="downloaded_csrs", help="Directory to save the file")
    
    # Batch download command
    batch_parser = subparsers.add_parser("batch-download", help="Download multiple CSR reports")
    batch_parser.add_argument("--therapeutic-area", help="Filter by therapeutic area")
    batch_parser.add_argument("--limit", type=int, default=10, help="Maximum number of reports to download")
    batch_parser.add_argument("--target-dir", default="downloaded_csrs", help="Directory to save the files")
    
    # List downloaded reports command
    list_parser = subparsers.add_parser("list", help="List downloaded reports")
    
    args = parser.parse_args()
    
    client = EmaApiClient()
    
    if args.command == "test":
        try:
            token = client.token_manager.get_token()
            print(f"Successfully obtained access token. Token starts with: {token[:15]}...")
        except Exception as e:
            print(f"Connection test failed: {str(e)}")
    
    elif args.command == "search":
        try:
            results = client.search_csr_reports(
                therapeutic_area=args.therapeutic_area,
                procedure_number=args.procedure_number,
                scientific_name=args.scientific_name,
                page=args.page,
                page_size=args.page_size
            )
            print(f"Found {len(results.get('items', []))} reports:")
            for item in results.get('items', []):
                print(f"- {item.get('id')}: {item.get('title')}")
        except Exception as e:
            print(f"Search failed: {str(e)}")
    
    elif args.command == "download":
        try:
            file_path = client.download_csr_report(args.report_id, args.target_dir)
            print(f"Successfully downloaded report to {file_path}")
        except Exception as e:
            print(f"Download failed: {str(e)}")
    
    elif args.command == "batch-download":
        try:
            file_paths = client.batch_download_reports(
                therapeutic_area=args.therapeutic_area,
                limit=args.limit,
                target_dir=args.target_dir
            )
            print(f"Successfully downloaded {len(file_paths)} reports:")
            for path in file_paths:
                print(f"- {path}")
        except Exception as e:
            print(f"Batch download failed: {str(e)}")
    
    elif args.command == "list":
        reports = client.list_downloaded_reports()
        print(f"Found {len(reports)} downloaded reports:")
        for report in reports:
            print(f"- {report['report_id']}: {report['title']} ({report['download_date']})")
    
    else:
        parser.print_help()