#!/usr/bin/env python3
"""
Check CSR Status Utility
-----------------------
This script checks the status of CSR imports and database counts.
"""

import os
import sys
import argparse
import sqlite3
import json
from pathlib import Path
from typing import Dict, List, Any

# Default database files
CSR_DATABASE = "csr_database.db"
EMA_DATABASE = "ema_web_downloads.db"
FDA_DATABASE = "fda_downloads.db"

def check_csr_database(db_path: str = CSR_DATABASE) -> Dict[str, Any]:
    """
    Check the CSR database for imported reports
    """
    result = {
        "exists": False,
        "count": 0,
        "therapeutic_areas": {},
        "phases": {},
        "sponsors": {},
        "details_count": 0
    }
    
    if not os.path.exists(db_path):
        return result
    
    result["exists"] = True
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Get total CSR count
        cursor.execute("SELECT COUNT(*) FROM csr_reports")
        result["count"] = cursor.fetchone()[0]
        
        # Get therapeutic areas distribution
        cursor.execute("""
        SELECT therapeutic_area, COUNT(*) FROM csr_reports 
        WHERE therapeutic_area IS NOT NULL
        GROUP BY therapeutic_area
        ORDER BY COUNT(*) DESC
        """)
        result["therapeutic_areas"] = {area: count for area, count in cursor.fetchall() if area}
        
        # Get phases distribution
        cursor.execute("""
        SELECT phase, COUNT(*) FROM csr_reports 
        WHERE phase IS NOT NULL
        GROUP BY phase
        ORDER BY COUNT(*) DESC
        """)
        result["phases"] = {phase: count for phase, count in cursor.fetchall() if phase}
        
        # Get sponsor distribution (top 10)
        cursor.execute("""
        SELECT sponsor, COUNT(*) FROM csr_reports 
        WHERE sponsor IS NOT NULL
        GROUP BY sponsor
        ORDER BY COUNT(*) DESC
        LIMIT 10
        """)
        result["sponsors"] = {sponsor: count for sponsor, count in cursor.fetchall() if sponsor}
        
        # Get CSR details count
        cursor.execute("SELECT COUNT(*) FROM csr_details")
        result["details_count"] = cursor.fetchone()[0]
        
        conn.close()
    except Exception as e:
        print(f"Error checking CSR database: {e}", file=sys.stderr)
    
    return result

def check_web_downloads(db_path: str = EMA_DATABASE) -> Dict[str, Any]:
    """
    Check the EMA web downloads database
    """
    result = {
        "exists": False,
        "count": 0,
        "therapeutic_areas": {},
        "imported": 0,
        "pending": 0
    }
    
    if not os.path.exists(db_path):
        return result
    
    result["exists"] = True
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Get total count
        cursor.execute("SELECT COUNT(*) FROM ema_reports")
        result["count"] = cursor.fetchone()[0]
        
        # Get therapeutic areas distribution
        cursor.execute("""
        SELECT therapeutic_area, COUNT(*) FROM ema_reports 
        WHERE therapeutic_area IS NOT NULL
        GROUP BY therapeutic_area
        ORDER BY COUNT(*) DESC
        """)
        result["therapeutic_areas"] = {area: count for area, count in cursor.fetchall() if area}
        
        # Get import status counts
        cursor.execute("SELECT COUNT(*) FROM ema_reports WHERE import_status = 'imported'")
        result["imported"] = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM ema_reports WHERE import_status = 'pending'")
        result["pending"] = cursor.fetchone()[0]
        
        conn.close()
    except Exception as e:
        print(f"Error checking EMA web downloads: {e}", file=sys.stderr)
    
    return result

def check_fda_downloads(db_path: str = FDA_DATABASE) -> Dict[str, Any]:
    """
    Check the FDA downloads database
    """
    result = {
        "exists": False,
        "count": 0,
        "therapeutic_areas": {},
        "imported": 0,
        "pending": 0,
        "download_status": {}
    }
    
    if not os.path.exists(db_path):
        return result
    
    result["exists"] = True
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Get total count
        cursor.execute("SELECT COUNT(*) FROM fda_reports")
        result["count"] = cursor.fetchone()[0]
        
        # Get therapeutic areas distribution if available
        try:
            cursor.execute("""
            SELECT therapeutic_area, COUNT(*) FROM fda_reports 
            WHERE therapeutic_area IS NOT NULL
            GROUP BY therapeutic_area
            ORDER BY COUNT(*) DESC
            """)
            result["therapeutic_areas"] = {area: count for area, count in cursor.fetchall() if area}
        except sqlite3.OperationalError:
            # Column might not exist
            pass
        
        # Get download status counts if available
        try:
            cursor.execute("""
            SELECT download_status, COUNT(*) FROM fda_reports 
            GROUP BY download_status
            """)
            result["download_status"] = {status: count for status, count in cursor.fetchall() if status}
        except sqlite3.OperationalError:
            # Column might not exist
            pass
        
        # Get import status counts if available
        try:
            cursor.execute("SELECT COUNT(*) FROM fda_reports WHERE import_status = 'imported'")
            result["imported"] = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(*) FROM fda_reports WHERE import_status = 'pending'")
            result["pending"] = cursor.fetchone()[0]
        except sqlite3.OperationalError:
            # Column might not exist
            pass
        
        conn.close()
    except Exception as e:
        print(f"Error checking FDA downloads: {e}", file=sys.stderr)
    
    return result

def check_pdf_directories() -> Dict[str, Any]:
    """
    Check directories for PDF files
    """
    result = {
        "attached_assets": 0,
        "downloaded_csrs": {
            "total": 0
        }
    }
    
    # Check attached_assets
    attached_assets_dir = Path("attached_assets")
    if attached_assets_dir.exists() and attached_assets_dir.is_dir():
        pdf_files = list(attached_assets_dir.glob("*.pdf"))
        result["attached_assets"] = len(pdf_files)
    
    # Check downloaded_csrs
    downloaded_csrs_dir = Path("downloaded_csrs")
    if downloaded_csrs_dir.exists() and downloaded_csrs_dir.is_dir():
        # Count total PDFs
        pdf_files = list(downloaded_csrs_dir.glob("**/*.pdf"))
        result["downloaded_csrs"]["total"] = len(pdf_files)
        
        # Count by subdirectory
        for subdir in downloaded_csrs_dir.iterdir():
            if subdir.is_dir():
                count = len(list(subdir.glob("*.pdf")))
                if count > 0:
                    result["downloaded_csrs"][subdir.name] = count
    
    return result

def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(description="Check CSR database status")
    parser.add_argument("--json", action="store_true", help="Output in JSON format")
    args = parser.parse_args()
    
    # Collect all status information
    csr_status = check_csr_database()
    ema_status = check_web_downloads()
    fda_status = check_fda_downloads()
    dir_status = check_pdf_directories()
    
    status = {
        "csr_database": csr_status,
        "ema_downloads": ema_status,
        "fda_downloads": fda_status,
        "pdf_directories": dir_status,
        "total_csrs_available": (csr_status.get("count", 0) + 
                                ema_status.get("pending", 0) + 
                                fda_status.get("pending", 0) +
                                dir_status.get("attached_assets", 0) - 
                                dir_status.get("downloaded_csrs", {}).get("total", 0))
    }
    
    if args.json:
        print(json.dumps(status, indent=2))
    else:
        print("\nCSR Status Report")
        print("================\n")
        
        print(f"Total CSRs in database: {csr_status['count']}")
        print(f"Total CSR details: {csr_status['details_count']}")
        
        if csr_status['therapeutic_areas']:
            print("\nTherapeutic areas:")
            for area, count in csr_status['therapeutic_areas'].items():
                print(f"  {area}: {count}")
        
        if csr_status['phases']:
            print("\nPhases:")
            for phase, count in csr_status['phases'].items():
                print(f"  {phase}: {count}")
        
        print("\nEMA Web Downloads:")
        if ema_status['exists']:
            print(f"  Total: {ema_status['count']}")
            print(f"  Imported: {ema_status['imported']}")
            print(f"  Pending: {ema_status['pending']}")
        else:
            print("  Database not found")
        
        print("\nFDA Downloads:")
        if fda_status['exists']:
            print(f"  Total: {fda_status['count']}")
            print(f"  Imported: {fda_status['imported']}")
            print(f"  Pending: {fda_status['pending']}")
            
            if fda_status['download_status']:
                print("  Download Status:")
                for status, count in fda_status['download_status'].items():
                    print(f"    {status}: {count}")
        else:
            print("  Database not found")
        
        print("\nPDF Directories:")
        print(f"  Attached Assets: {dir_status['attached_assets']} PDFs")
        print(f"  Downloaded CSRs: {dir_status['downloaded_csrs']['total']} PDFs")
        
        for key, value in dir_status['downloaded_csrs'].items():
            if key != "total":
                print(f"    {key}: {value} PDFs")
        
        print(f"\nTotal estimated CSRs available to import: {status['total_csrs_available']}")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())