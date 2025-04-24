"""
ICH Guidelines Ingestion Service for ICH Wiz

This module handles the ingestion of ICH guidelines documents,
extracting text from PDFs and other files, and indexing them
for retrieval by the ICH Wiz agent.
"""
import glob
import json
import os
import re
import time
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Any, Set, Tuple

import PyPDF2
import structlog

from services.ich_wiz.config import settings
from services.ich_wiz.indexer import (
    index_document, 
    is_processed, 
    mark_as_processed,
    get_processed_files,
    initialize as initialize_indexer
)

# Set up logging
logger = structlog.get_logger(__name__)

# Regular expressions for extracting metadata
GUIDELINE_NUMBER_PATTERN = re.compile(r'(E|M|Q|S)(\d+)([A-Z]*)(\(R\d+\))?')
ICH_DATE_PATTERN = re.compile(r'(\d{4})[-_](\d{2})[-_](\d{2})')


def extract_text_from_pdf(pdf_path: Path) -> Tuple[str, Dict[str, Any]]:
    """
    Extract text and metadata from a PDF file.
    
    Args:
        pdf_path: Path to the PDF file
        
    Returns:
        Tuple of (extracted text, metadata dictionary)
    """
    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            num_pages = len(pdf_reader.pages)
            
            # Extract text from all pages
            text = ""
            for page_num in range(num_pages):
                page = pdf_reader.pages[page_num]
                text += page.extract_text() + "\n\n"
            
            # Extract metadata
            metadata = {
                "page_count": num_pages,
                "file_size": os.path.getsize(pdf_path),
                "extracted_at": datetime.now().isoformat(),
            }
            
            # Try to extract information from document info
            if pdf_reader.metadata:
                info = pdf_reader.metadata
                if info.title:
                    metadata["title"] = info.title
                if info.author:
                    metadata["author"] = info.author
                if info.subject:
                    metadata["subject"] = info.subject
                if info.creator:
                    metadata["creator"] = info.creator
                if hasattr(info, "creation_date") and info.creation_date:
                    metadata["creation_date"] = info.creation_date
            
            return text, metadata
    
    except Exception as e:
        logger.error("Failed to extract text from PDF", file_path=str(pdf_path), error=str(e))
        raise


def extract_guideline_info(file_path: Path) -> Dict[str, Any]:
    """
    Extract ICH guideline information from file path and name.
    
    Args:
        file_path: Path to the guideline file
        
    Returns:
        Dictionary of extracted guideline information
    """
    file_name = file_path.name
    info = {}
    
    # Try to extract guideline number (e.g., E6(R2), Q1A)
    guideline_match = GUIDELINE_NUMBER_PATTERN.search(file_name)
    if guideline_match:
        prefix = guideline_match.group(1)  # E, M, Q, S
        number = guideline_match.group(2)  # Numeric part
        suffix = guideline_match.group(3) or ""  # Optional letter suffix
        revision = guideline_match.group(4) or ""  # Optional revision like (R2)
        
        info["guideline_type"] = prefix
        info["guideline_number"] = number
        info["guideline_suffix"] = suffix
        info["guideline_revision"] = revision
        info["guideline_id"] = f"{prefix}{number}{suffix}{revision}"
    
    # Try to extract date (e.g., 2021_05_13)
    date_match = ICH_DATE_PATTERN.search(file_name)
    if date_match:
        year = date_match.group(1)
        month = date_match.group(2)
        day = date_match.group(3)
        
        info["document_year"] = year
        info["document_month"] = month
        info["document_day"] = day
        info["document_date"] = f"{year}-{month}-{day}"
    
    return info


def process_guideline_file(file_path: Path) -> None:
    """
    Process an ICH guideline file, extracting text and metadata,
    and indexing it in the vector database.
    
    Args:
        file_path: Path to the guideline file
    """
    try:
        # Skip if already processed
        if is_processed(file_path):
            logger.info("File already processed, skipping", file_path=str(file_path))
            return
        
        logger.info("Processing guideline file", file_path=str(file_path))
        
        # Extract guideline information from file name
        guideline_info = extract_guideline_info(file_path)
        logger.info("Extracted guideline info", file_path=str(file_path), guideline_info=guideline_info)
        
        # Extract text and metadata from file
        if file_path.suffix.lower() == '.pdf':
            text, file_metadata = extract_text_from_pdf(file_path)
        else:
            # For text files, just read the content
            with open(file_path, 'r', encoding='utf-8') as f:
                text = f.read()
            file_metadata = {
                "file_size": os.path.getsize(file_path),
                "extracted_at": datetime.now().isoformat(),
            }
        
        # Skip if no text was extracted
        if not text.strip():
            logger.warning("No text extracted from file, skipping", file_path=str(file_path))
            return
        
        # Combine metadata
        metadata = {
            **guideline_info,
            **file_metadata,
            "source_type": "ich_guideline",
        }
        
        # Index the document
        vector_count, vector_ids = index_document(
            file_path=file_path,
            document_type="ich_guideline",
            metadata=metadata
        )
        
        # Mark as processed
        mark_as_processed(
            file_path=file_path,
            document_type="ich_guideline",
            vector_count=vector_count,
            vector_ids=vector_ids,
            metadata=metadata
        )
        
        logger.info("Successfully processed guideline file", 
                   file_path=str(file_path), 
                   vector_count=vector_count)
    
    except Exception as e:
        logger.error("Failed to process guideline file", file_path=str(file_path), error=str(e))


def scan_guidelines_directory() -> None:
    """
    Scan the guidelines directory for new or updated files and process them.
    """
    guidelines_dir = settings.get_guidelines_dir()
    
    try:
        # Get list of all files in directory and subdirectories
        pdf_pattern = str(guidelines_dir / "**" / "*.pdf")
        txt_pattern = str(guidelines_dir / "**" / "*.txt")
        xlsx_pattern = str(guidelines_dir / "**" / "*.xlsx")
        json_pattern = str(guidelines_dir / "**" / "*.json")
        
        file_paths = []
        for pattern in [pdf_pattern, txt_pattern, xlsx_pattern, json_pattern]:
            file_paths.extend(glob.glob(pattern, recursive=True))
        
        # Convert to Path objects
        file_paths = [Path(p) for p in file_paths]
        
        logger.info("Found files in guidelines directory", file_count=len(file_paths))
        
        # Process each file
        for file_path in file_paths:
            process_guideline_file(file_path)
        
        logger.info("Finished scanning guidelines directory", processed_count=len(file_paths))
    
    except Exception as e:
        logger.error("Failed to scan guidelines directory", error=str(e))


def copy_attached_assets() -> None:
    """
    Copy ICH guideline documents from the attached_assets directory
    to the guidelines directory for processing.
    """
    attached_assets_dir = Path("attached_assets")
    guidelines_dir = settings.get_guidelines_dir()
    
    try:
        # Check if attached_assets directory exists
        if not attached_assets_dir.exists() or not attached_assets_dir.is_dir():
            logger.warning("attached_assets directory not found")
            return
        
        # Get list of all ICH-related PDF files
        ich_patterns = [
            "*ICH*",
            "ICH_*",
            "*ICH_*",
            "*_ICH_*",
            "ich_*",
            "*ich*",
            "Q*Guideline*",
            "E*Guideline*",
            "M*Guideline*",
            "S*Guideline*",
            "*Q1*",
            "*Q2*",
            "*Q3*",
            "*Q4*",
            "*Q5*",
            "*Q6*",
            "*Q7*",
            "*Q8*",
            "*Q9*",
            "*Q10*",
            "*Q11*",
            "*Q12*",
            "*Q13*",
            "*Q14*",
            "*E1*",
            "*E2*",
            "*E3*",
            "*E4*",
            "*E5*",
            "*E6*",
            "*E7*",
            "*E8*",
            "*E9*",
            "*E10*",
            "*E11*",
            "*E12*",
            "*E14*",
            "*E15*",
            "*E16*",
            "*E17*",
            "*E18*",
            "*E19*",
            "*E20*",
            "*M1*",
            "*M2*",
            "*M3*",
            "*M4*",
            "*M5*",
            "*M6*",
            "*M7*",
            "*M8*",
            "*M9*",
            "*M10*",
            "*M11*",
            "*M12*",
            "*S1*",
            "*S2*",
            "*S3*",
            "*S4*",
            "*S5*",
            "*S6*",
            "*S7*",
            "*S8*",
            "*S9*",
            "*S10*",
            "*S11*",
            "*S12*",
            "eCTD*",
            "*eCTD*",
        ]
        
        all_pdf_files = []
        for pattern in ich_patterns:
            pdf_pattern = str(attached_assets_dir / f"{pattern}.pdf")
            all_pdf_files.extend(glob.glob(pdf_pattern))
        
        # Remove duplicates
        all_pdf_files = list(set(all_pdf_files))
        
        # Convert to Path objects
        all_pdf_files = [Path(p) for p in all_pdf_files]
        
        logger.info("Found ICH-related PDF files in attached_assets", file_count=len(all_pdf_files))
        
        # Create target directory if it doesn't exist
        os.makedirs(guidelines_dir, exist_ok=True)
        
        # Copy files
        copied_count = 0
        for pdf_file in all_pdf_files:
            target_path = guidelines_dir / pdf_file.name
            
            # Skip if target already exists and is newer than source
            if target_path.exists() and target_path.stat().st_mtime >= pdf_file.stat().st_mtime:
                logger.debug("Target file already exists and is up to date, skipping",
                           source=str(pdf_file), target=str(target_path))
                continue
            
            # Copy the file
            with open(pdf_file, 'rb') as src, open(target_path, 'wb') as dst:
                dst.write(src.read())
            copied_count += 1
            logger.info("Copied file", source=str(pdf_file), target=str(target_path))
        
        logger.info("Finished copying ICH files from attached_assets", copied_count=copied_count)
    
    except Exception as e:
        logger.error("Failed to copy attached assets", error=str(e))


def generate_stats() -> Dict[str, Any]:
    """
    Generate statistics about the processed documents.
    
    Returns:
        Dictionary of statistics
    """
    try:
        registry = get_processed_files()
        
        # Count by document type
        doc_type_counts = {}
        guideline_type_counts = {}
        total_vectors = 0
        
        for _, info in registry.items():
            doc_type = info.get("document_type", "unknown")
            doc_type_counts[doc_type] = doc_type_counts.get(doc_type, 0) + 1
            
            # For ICH guidelines, count by guideline type (E, M, Q, S)
            if doc_type == "ich_guideline":
                guideline_type = info.get("metadata", {}).get("guideline_type", "unknown")
                guideline_type_counts[guideline_type] = guideline_type_counts.get(guideline_type, 0) + 1
            
            total_vectors += info.get("vector_count", 0)
        
        return {
            "total_documents": len(registry),
            "document_type_counts": doc_type_counts,
            "guideline_type_counts": guideline_type_counts,
            "total_vectors": total_vectors,
            "generated_at": datetime.now().isoformat(),
        }
    
    except Exception as e:
        logger.error("Failed to generate stats", error=str(e))
        return {
            "error": str(e),
            "generated_at": datetime.now().isoformat(),
        }


def save_stats(stats: Dict[str, Any]) -> None:
    """
    Save statistics to a file.
    
    Args:
        stats: Dictionary of statistics
    """
    try:
        stats_file = Path(settings.DATA_DIR) / "stats.json"
        with open(stats_file, 'w', encoding='utf-8') as f:
            json.dump(stats, f, indent=2)
        logger.info("Saved stats to file", file_path=str(stats_file))
    
    except Exception as e:
        logger.error("Failed to save stats", error=str(e))


def run_ingest() -> None:
    """
    Run the ingestion process.
    """
    try:
        logger.info("Starting ICH Wiz ingestion service")
        
        # Initialize the indexer
        initialize_indexer()
        
        # Copy ICH guidelines from attached_assets
        copy_attached_assets()
        
        # Scan guidelines directory
        scan_guidelines_directory()
        
        # Generate and save statistics
        stats = generate_stats()
        save_stats(stats)
        
        logger.info("Finished ingestion process", stats=stats)
    
    except Exception as e:
        logger.error("Ingestion process failed", error=str(e))


# Entry point
if __name__ == "__main__":
    # Set up directories
    os.makedirs(settings.DATA_DIR, exist_ok=True)
    os.makedirs(settings.GUIDELINES_DIR, exist_ok=True)
    os.makedirs(settings.UPLOADS_DIR, exist_ok=True)
    
    # Run ingestion
    run_ingest()