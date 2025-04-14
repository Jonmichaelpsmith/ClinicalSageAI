"""
EMA API Integration for FailMap Application
------------------------------------------
This module integrates the EMA API client with the FailMap application,
providing endpoints to search, download, and process CSRs.
"""

import os
import json
import logging
import sqlite3
import threading
from datetime import datetime
from typing import Dict, List, Any, Optional, Tuple
from flask import Blueprint, request, jsonify, current_app, render_template, Response, stream_with_context
import pandas as pd

# Import EMA API components
from ema_api import EmaApiClient, CSR_DATABASE
from bulk_download_csrs import BulkDownloader, DOWNLOAD_DIR, PROGRESS_FILE

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("ema_integration.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger('ema_integration')

# Global background task state
background_task = {
    "running": False,
    "task_type": None,
    "start_time": None,
    "progress": None,
    "status_message": None,
    "result": None,
    "error": None
}

# Create Blueprint
ema_bp = Blueprint('ema', __name__, url_prefix='/ema')

# Helper functions
def get_db_connection():
    """Get a connection to the CSR database."""
    conn = sqlite3.connect(CSR_DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def csr_to_dict(csr: sqlite3.Row) -> Dict[str, Any]:
    """Convert a CSR database row to a dictionary."""
    if not csr:
        return {}
    
    result = dict(csr)
    
    # Parse the metadata JSON if it exists
    if result.get('metadata'):
        try:
            result['metadata'] = json.loads(result['metadata'])
        except json.JSONDecodeError:
            result['metadata'] = {}
    
    return result

def start_background_download(therapeutic_area: Optional[str] = None, 
                           limit: Optional[int] = None,
                           batch_size: int = 50,
                           max_workers: int = 5):
    """Start a background download task."""
    global background_task
    
    if background_task["running"]:
        return {"error": "A background task is already running."}
    
    background_task.update({
        "running": True,
        "task_type": "download",
        "start_time": datetime.now().isoformat(),
        "progress": 0,
        "status_message": "Starting download...",
        "result": None,
        "error": None
    })
    
    # Start the download in a separate thread
    thread = threading.Thread(
        target=_run_background_download,
        args=(therapeutic_area, limit, batch_size, max_workers)
    )
    thread.daemon = True
    thread.start()
    
    return {
        "status": "started",
        "task_type": background_task["task_type"],
        "start_time": background_task["start_time"]
    }

def _run_background_download(therapeutic_area: Optional[str], 
                          limit: Optional[int],
                          batch_size: int,
                          max_workers: int):
    """Execute the bulk download in the background."""
    global background_task
    
    try:
        downloader = BulkDownloader()
        
        # Update status periodically in a separate thread
        stop_status_thread = threading.Event()
        status_thread = threading.Thread(
            target=_update_download_status,
            args=(downloader, stop_status_thread)
        )
        status_thread.daemon = True
        status_thread.start()
        
        # Run the download
        result = downloader.bulk_download(
            therapeutic_area=therapeutic_area,
            limit=limit,
            batch_size=batch_size,
            max_workers=max_workers
        )
        
        # Stop the status thread
        stop_status_thread.set()
        status_thread.join(timeout=2)
        
        # Update task state
        background_task.update({
            "running": False,
            "progress": 100,
            "status_message": "Download completed.",
            "result": result
        })
        
    except Exception as e:
        logger.error(f"Background download failed: {str(e)}")
        background_task.update({
            "running": False,
            "status_message": "Download failed.",
            "error": str(e)
        })

def _update_download_status(downloader: BulkDownloader, stop_event: threading.Event):
    """Periodically update the download status."""
    global background_task
    
    while not stop_event.is_set():
        try:
            summary = downloader.get_progress_summary()
            
            if summary["total_found"] > 0:
                progress = (summary["downloaded"] / summary["total_found"]) * 100
            else:
                progress = 0
            
            background_task.update({
                "progress": progress,
                "status_message": (
                    f"Downloaded {summary['downloaded']} of {summary['total_found']} CSRs "
                    f"({progress:.1f}%). Elapsed: {summary['elapsed_time']}, "
                    f"ETA: {summary['estimated_time_remaining']}"
                )
            })
            
        except Exception as e:
            logger.error(f"Error updating status: {str(e)}")
            background_task.update({
                "status_message": f"Download in progress, but status update failed: {str(e)}"
            })
        
        # Check every 5 seconds
        for _ in range(5):
            if stop_event.is_set():
                break
            stop_event.wait(1)

def start_background_retry():
    """Start a background retry task for failed downloads."""
    global background_task
    
    if background_task["running"]:
        return {"error": "A background task is already running."}
    
    background_task.update({
        "running": True,
        "task_type": "retry",
        "start_time": datetime.now().isoformat(),
        "progress": 0,
        "status_message": "Starting retry of failed downloads...",
        "result": None,
        "error": None
    })
    
    # Start the retry in a separate thread
    thread = threading.Thread(target=_run_background_retry)
    thread.daemon = True
    thread.start()
    
    return {
        "status": "started",
        "task_type": background_task["task_type"],
        "start_time": background_task["start_time"]
    }

def _run_background_retry():
    """Execute the retry in the background."""
    global background_task
    
    try:
        downloader = BulkDownloader()
        
        # Get initial count of failed downloads
        initial_summary = downloader.get_progress_summary()
        initial_failed = initial_summary["failed"]
        
        if initial_failed == 0:
            background_task.update({
                "running": False,
                "progress": 100,
                "status_message": "No failed downloads to retry.",
                "result": {"retried": 0, "successful": 0, "still_failing": 0}
            })
            return
        
        # Run the retry
        result = downloader.retry_failed()
        
        # Calculate progress
        final_summary = downloader.get_progress_summary()
        
        background_task.update({
            "running": False,
            "progress": 100,
            "status_message": (
                f"Retry completed. {result['successful']} of {result['retried']} "
                f"previously failed downloads were successful."
            ),
            "result": result
        })
        
    except Exception as e:
        logger.error(f"Background retry failed: {str(e)}")
        background_task.update({
            "running": False,
            "status_message": "Retry failed.",
            "error": str(e)
        })


def process_csrs_for_analysis():
    """
    Process downloaded CSR reports for use in the analysis.
    This converts the downloaded CSRs into the format expected by the FailMap application.
    """
    try:
        # Connect to CSR database
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get all downloaded CSRs
        cursor.execute("""
            SELECT * FROM csr_reports
            WHERE downloaded = 1
        """)
        
        csrs = cursor.fetchall()
        
        if not csrs:
            return {
                "status": "error",
                "message": "No downloaded CSRs found to process."
            }
        
        # Process each CSR and convert to the format needed for analysis
        processed_count = 0
        
        for csr in csrs:
            csr_dict = csr_to_dict(csr)
            
            # Extract data for analysis (modify as needed for your application)
            therapeutic_area = csr_dict.get('therapeutic_area')
            indication = csr_dict.get('scientific_name')
            phase = None
            
            # Try to extract phase from metadata or title
            metadata = csr_dict.get('metadata', {})
            if isinstance(metadata, dict):
                phase = metadata.get('phase')
            
            if not phase and 'title' in csr_dict:
                # Try to extract phase from title (e.g., "Phase II Study of...")
                title = csr_dict['title']
                if 'phase i' in title.lower():
                    phase = 'I'
                elif 'phase ii' in title.lower():
                    phase = 'II'
                elif 'phase iii' in title.lower():
                    phase = 'III'
                elif 'phase iv' in title.lower():
                    phase = 'IV'
            
            # More processing logic here...
            
            processed_count += 1
        
        return {
            "status": "success",
            "processed": processed_count,
            "total": len(csrs),
            "message": f"Successfully processed {processed_count} of {len(csrs)} CSRs."
        }
        
    except Exception as e:
        logger.error(f"Error processing CSRs: {str(e)}")
        return {
            "status": "error",
            "message": f"Failed to process CSRs: {str(e)}"
        }
    finally:
        if 'conn' in locals():
            conn.close()

# Routes
@ema_bp.route('/status')
def status():
    """Get EMA API integration status."""
    downloader = BulkDownloader()
    status_summary = downloader.get_progress_summary()
    
    # Get counts of CSRs in the database
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT COUNT(*) FROM csr_reports WHERE downloaded = 1")
        downloaded_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM csr_reports")
        total_records = cursor.fetchone()[0]
        
        conn.close()
    except Exception as e:
        logger.error(f"Database error: {str(e)}")
        downloaded_count = "Error"
        total_records = "Error"
    
    return jsonify({
        "api_status": "connected",
        "download_progress": status_summary,
        "background_task": {
            "running": background_task["running"],
            "task_type": background_task["task_type"],
            "start_time": background_task["start_time"],
            "progress": background_task["progress"],
            "status_message": background_task["status_message"],
            "error": background_task["error"]
        },
        "database": {
            "downloaded_csrs": downloaded_count,
            "total_records": total_records
        }
    })

@ema_bp.route('/download', methods=['POST'])
def start_download():
    """Start a background download task."""
    data = request.json or {}
    
    therapeutic_area = data.get('therapeutic_area')
    limit = data.get('limit')
    batch_size = data.get('batch_size', 50)
    max_workers = data.get('max_workers', 5)
    
    result = start_background_download(
        therapeutic_area=therapeutic_area,
        limit=limit,
        batch_size=batch_size,
        max_workers=max_workers
    )
    
    return jsonify(result)

@ema_bp.route('/retry', methods=['POST'])
def retry_failed():
    """Retry failed downloads."""
    result = start_background_retry()
    return jsonify(result)

@ema_bp.route('/search', methods=['GET'])
def search_csrs():
    """Search for CSRs via the EMA API."""
    therapeutic_area = request.args.get('therapeutic_area')
    procedure_number = request.args.get('procedure_number')
    scientific_name = request.args.get('scientific_name')
    page = int(request.args.get('page', 1))
    page_size = int(request.args.get('page_size', 20))
    
    client = EmaApiClient()
    
    try:
        results = client.search_csr_reports(
            therapeutic_area=therapeutic_area,
            procedure_number=procedure_number,
            scientific_name=scientific_name,
            page=page,
            page_size=page_size
        )
        return jsonify(results)
    except Exception as e:
        logger.error(f"Search error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@ema_bp.route('/reports', methods=['GET'])
def list_reports():
    """List downloaded CSR reports."""
    page = int(request.args.get('page', 1))
    page_size = int(request.args.get('page_size', 20))
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get total count
        cursor.execute("SELECT COUNT(*) FROM csr_reports WHERE downloaded = 1")
        total_count = cursor.fetchone()[0]
        
        # Get paginated reports
        offset = (page - 1) * page_size
        cursor.execute(
            """
            SELECT * FROM csr_reports 
            WHERE downloaded = 1
            ORDER BY download_date DESC
            LIMIT ? OFFSET ?
            """,
            (page_size, offset)
        )
        
        reports = [csr_to_dict(row) for row in cursor.fetchall()]
        
        conn.close()
        
        return jsonify({
            "total": total_count,
            "page": page,
            "page_size": page_size,
            "total_pages": (total_count + page_size - 1) // page_size,
            "items": reports
        })
    except Exception as e:
        logger.error(f"Database error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@ema_bp.route('/reports/<report_id>', methods=['GET'])
def get_report(report_id):
    """Get details for a specific CSR report."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            "SELECT * FROM csr_reports WHERE report_id = ?",
            (report_id,)
        )
        
        report = cursor.fetchone()
        
        if not report:
            return jsonify({"error": "Report not found"}), 404
        
        report_dict = csr_to_dict(report)
        
        conn.close()
        
        return jsonify(report_dict)
    except Exception as e:
        logger.error(f"Database error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@ema_bp.route('/process', methods=['POST'])
def process_reports():
    """Process downloaded CSRs for analysis."""
    result = process_csrs_for_analysis()
    return jsonify(result)

@ema_bp.route('/dashboard')
def dashboard():
    """EMA API dashboard for monitoring downloads and integration."""
    # This would be a web interface to monitor and manage the EMA API integration
    # For now, just redirect to a simple status page
    return render_template('ema_dashboard.html')

# Function to register the blueprint with the Flask app
def register_ema_blueprint(app):
    app.register_blueprint(ema_bp)
    logger.info("Registered EMA API blueprint")