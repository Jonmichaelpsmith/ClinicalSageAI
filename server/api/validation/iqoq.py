"""
IQ/OQ/PQ API Endpoint

This module provides API endpoints to generate and download IQ/OQ/PQ validation 
documentation in various formats (DOCX, PDF, ZIP bundle).
"""

import os
import sys
import time
import json
import shutil
import logging
from typing import Dict, List, Optional, Union
from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse, JSONResponse

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from utils.iqoq_generator import main as generate_iqoq, OUTPUT_DIR

# Initialize router
router = APIRouter()

# Make sure output directory exists
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Logger configuration
logger = logging.getLogger(__name__)

# Cache for recent files to avoid regenerating unless requested
file_cache = {
    "last_generated": 0,
    "files": {},
    "generation_in_progress": False
}

class ValidationError(Exception):
    """Exception raised for validation errors"""
    pass

def find_latest_validation_files() -> Dict[str, str]:
    """Find the latest generated validation files in the output directory"""
    try:
        # Get all the files in the output directory
        try:
            files = os.listdir(OUTPUT_DIR)
        except FileNotFoundError:
            os.makedirs(OUTPUT_DIR, exist_ok=True)
            files = []

        # Filter for validation files
        docx_files = [f for f in files if f.endswith('.docx') and f.startswith('IQOQ_PQ_')]
        json_files = [f for f in files if f.endswith('.json') and f.startswith('system_info_')]
        checksum_files = [f for f in files if f.endswith('.json') and f.startswith('checksums_')]
        
        # Return latest if any found
        result = {}
        
        # Always include the standard "IQOQ_PQ.docx" if it exists
        standard_docx = os.path.join(OUTPUT_DIR, "IQOQ_PQ.docx")
        if os.path.exists(standard_docx):
            result["standard_docx"] = standard_docx
            
        # Get timestamp-based latest files
        if docx_files:
            latest_docx = sorted(docx_files, reverse=True)[0]
            result["docx"] = os.path.join(OUTPUT_DIR, latest_docx)
            
        if json_files:
            latest_json = sorted(json_files, reverse=True)[0]
            result["json"] = os.path.join(OUTPUT_DIR, latest_json)
            
        if checksum_files:
            latest_checksum = sorted(checksum_files, reverse=True)[0]
            result["checksum"] = os.path.join(OUTPUT_DIR, latest_checksum)
        
        return result
    except Exception as e:
        logger.error(f"Error finding validation files: {e}")
        return {}

def create_zip_bundle(files: Dict[str, str]) -> Optional[str]:
    """Create a ZIP bundle containing all validation artifacts"""
    try:
        if not files:
            return None
            
        timestamp = time.strftime("%Y%m%d_%H%M%S")
        zip_path = os.path.join(OUTPUT_DIR, f"validation_bundle_{timestamp}.zip")
        
        # Create a temporary directory to organize files
        temp_dir = os.path.join(OUTPUT_DIR, f"temp_bundle_{timestamp}")
        os.makedirs(temp_dir, exist_ok=True)
        
        try:
            # Copy files to temp directory with standardized names
            for file_type, file_path in files.items():
                if not os.path.exists(file_path):
                    continue
                    
                file_name = os.path.basename(file_path)
                dest_path = os.path.join(temp_dir, file_name)
                shutil.copy2(file_path, dest_path)
            
            # Create the ZIP file
            shutil.make_archive(zip_path[:-4], 'zip', temp_dir)
            
            # Return the path to the ZIP file
            return zip_path
        finally:
            # Clean up the temporary directory
            shutil.rmtree(temp_dir, ignore_errors=True)
    except Exception as e:
        logger.error(f"Error creating ZIP bundle: {e}")
        return None

def generate_validation_files(force: bool = False) -> Dict[str, str]:
    """Generate validation files if they don't exist or force is True"""
    global file_cache
    
    # If files were generated recently and force=False, return cached paths
    current_time = time.time()
    if not force and file_cache["last_generated"] > 0:
        # Cache for 1 hour unless force=True
        if current_time - file_cache["last_generated"] < 3600:
            # Check if files still exist
            all_exist = all(os.path.exists(path) for path in file_cache["files"].values())
            if all_exist:
                return file_cache["files"]
    
    # Generate new validation files
    try:
        # Call the generator
        results = generate_iqoq()
        
        # Update the cache
        file_cache["last_generated"] = current_time
        file_cache["files"] = results
        
        return results
    except Exception as e:
        logger.error(f"Error generating validation files: {e}")
        # Try to find existing files as fallback
        existing_files = find_latest_validation_files()
        if existing_files:
            return existing_files
        raise ValidationError(f"Failed to generate validation files: {str(e)}")

def background_generate_task():
    """Task for background generation of validation files"""
    global file_cache
    try:
        generate_validation_files(force=True)
        logger.info("Background validation file generation completed successfully")
    except Exception as e:
        logger.error(f"Background validation file generation failed: {e}")
    finally:
        # Reset the in_progress flag
        file_cache["generation_in_progress"] = False

@router.get("/iqoq")
async def get_validation_status():
    """Get validation documentation status and available files"""
    try:
        # Look for existing validation files
        files = find_latest_validation_files()
        
        if files:
            # Return information about available files
            response = {
                "status": "available",
                "generated_at": file_cache.get("last_generated", 0),
                "available_formats": list(files.keys()),
                "download_urls": {
                    k: f"/api/validation/iqoq/download?format={k}" for k in files.keys()
                }
            }
        else:
            # No files available
            response = {
                "status": "unavailable",
                "message": "No validation files found. Generate files first.",
                "generate_url": "/api/validation/iqoq/generate"
            }
        
        return response
    except Exception as e:
        logger.error(f"Error checking validation status: {e}")
        raise HTTPException(status_code=500, detail=f"Error checking validation status: {str(e)}")

@router.post("/iqoq/generate")
async def generate_validation_documents(background_tasks: BackgroundTasks, force: bool = False):
    """Generate validation documentation in the background"""
    try:
        # Check if generation is already in progress
        if file_cache.get("generation_in_progress", False):
            return {
                "status": "in_progress",
                "message": "Validation file generation already in progress. Please check back later."
            }
        
        # Mark generation as in progress
        file_cache["generation_in_progress"] = True
        
        # Start generation in the background
        background_tasks.add_task(background_generate_task)
        
        return {
            "status": "started",
            "message": "Validation file generation started. Check status endpoint for completion."
        }
    except Exception as e:
        # Reset the in_progress flag on error
        file_cache["generation_in_progress"] = False
        logger.error(f"Error starting validation file generation: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"Error starting validation file generation: {str(e)}"
        )

@router.get("/iqoq/download")
async def download_validation_document(format: str = "docx", generate_if_missing: bool = False):
    """Download validation documents in the specified format"""
    try:
        # Look for existing validation files
        files = find_latest_validation_files()
        
        # If the requested format is not available, try to generate if asked
        if format not in files and generate_if_missing:
            files = generate_validation_files(force=True)
        
        # Check if the requested format is available
        if format not in files:
            raise HTTPException(
                status_code=404, 
                detail=f"Validation document in format '{format}' not available. "
                       f"Available formats: {list(files.keys()) if files else 'none'}"
            )
        
        # If "zip" is requested but not available, create a bundle
        if format == "zip" and "zip" not in files:
            zip_path = create_zip_bundle(files)
            if not zip_path:
                raise HTTPException(
                    status_code=500, 
                    detail="Failed to create ZIP bundle"
                )
            return FileResponse(
                zip_path, 
                media_type="application/zip",
                filename=f"validation_bundle.zip"
            )
        
        # Return the requested file
        file_path = files[format]
        file_name = os.path.basename(file_path)
        
        # Determine media type based on format
        media_types = {
            "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "json": "application/json",
            "checksum": "application/json",
            "pdf": "application/pdf",
            "standard_docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        }
        
        media_type = media_types.get(format, "application/octet-stream")
        
        return FileResponse(
            file_path, 
            media_type=media_type,
            filename=file_name
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error downloading validation document: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"Error downloading validation document: {str(e)}"
        )

@router.get("/iqoq/bundle")
async def download_validation_bundle(generate_if_missing: bool = False):
    """Download a complete validation bundle as a ZIP file"""
    try:
        # Look for existing validation files
        files = find_latest_validation_files()
        
        # If no files found and generation requested, generate them
        if (not files or len(files) < 2) and generate_if_missing:
            files = generate_validation_files(force=True)
        
        # If still no files, return error
        if not files or len(files) < 2:
            raise HTTPException(
                status_code=404, 
                detail=f"Insufficient validation files available to create bundle. "
                       f"Generate validation files first."
            )
        
        # Create a ZIP bundle
        zip_path = create_zip_bundle(files)
        if not zip_path:
            raise HTTPException(
                status_code=500, 
                detail="Failed to create ZIP bundle"
            )
        
        # Return the ZIP file
        return FileResponse(
            zip_path, 
            media_type="application/zip",
            filename="validation_bundle.zip"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating validation bundle: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"Error creating validation bundle: {str(e)}"
        )