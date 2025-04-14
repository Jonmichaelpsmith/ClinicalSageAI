#!/usr/bin/env python3
"""
Import PDFs to CSR Database
---------------------------
This script imports PDFs from attached_assets folder into the CSR database system.
It extracts text from PDFs, creates structured CSR objects, and adds them to the database.
"""

import os
import sys
import json
import sqlite3
from datetime import datetime
import logging
import uuid
import glob
import time
from typing import List, Dict, Any, Optional

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger("csr-importer")

# Constants
PDF_SOURCE_DIR = "attached_assets"
PROCESSED_CSR_DIR = "data/processed_csrs"
DATA_DIR = "data"
DB_PATH = os.path.join("data/vector_store", "csr_metadata.db")

# Ensure directories exist
os.makedirs(PROCESSED_CSR_DIR, exist_ok=True)
os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
os.makedirs(DATA_DIR, exist_ok=True)

# Attempt to use pdfminer.six for PDF extraction
try:
    from pdfminer.high_level import extract_text
    logger.info("Using pdfminer.six for PDF extraction")
except ImportError:
    logger.warning("pdfminer.six not available, will attempt to install later")

def extract_text_from_pdf(pdf_path: str) -> str:
    """Extract text from a PDF file using pdfminer.six"""
    try:
        return extract_text(pdf_path)
    except Exception as e:
        logger.error(f"Error extracting text from {pdf_path}: {e}")
        return ""

def extract_metadata_from_text(text: str, pdf_path: str) -> Dict[str, Any]:
    """Extract CSR metadata from text using simple heuristics and match existing CSR format"""
    # Generate a unique ID with "PDF-" prefix to distinguish from existing CSRs
    unique_id = f"PDF-{str(uuid.uuid4())[:8]}"
    
    # Initialize with standard fields found in CSRs
    metadata = {
        "nctrialId": unique_id,
        "csr_id": unique_id,
        "title": "",
        "officialTitle": "",
        "sponsor": "Unknown",
        "indication": "",
        "phase": "",
        "fileName": os.path.basename(pdf_path),
        "fileSize": os.path.getsize(pdf_path),
        "date": datetime.now().strftime("%Y-%m-%d"),
        "completionDate": "",
        "drugName": "",
        "source": "Attached PDF Assets",
        "studyType": "Interventional",
        "status": "Completed",
        "description": "",
        "eligibilityCriteria": ""
    }

    # Extract title (assume it's in the first few lines)
    lines = text.split('\n')
    title_candidates = [line.strip() for line in lines[:10] if len(line.strip()) > 20 and len(line.strip()) < 200]
    if title_candidates:
        metadata["title"] = title_candidates[0]
        metadata["officialTitle"] = title_candidates[0]

    # Try to identify phase
    phase_keywords = {
        "Phase 1": "Phase 1",
        "Phase I": "Phase 1",
        "Phase 2": "Phase 2",
        "Phase II": "Phase 2",
        "Phase 3": "Phase 3",
        "Phase III": "Phase 3",
        "Phase 4": "Phase 4",
        "Phase IV": "Phase 4"
    }
    
    for keyword, phase in phase_keywords.items():
        if keyword in text:
            metadata["phase"] = phase
            break

    # Try to extract indication
    common_indications = [
        "arthritis", "asthma", "cancer", "diabetes", "hypertension", 
        "depression", "anxiety", "schizophrenia", "alzheimer", "parkinson",
        "multiple sclerosis", "epilepsy", "hiv", "hepatitis", "influenza",
        "covid", "obesity", "copd", "heart failure", "stroke"
    ]
    
    for indication in common_indications:
        if indication.lower() in text.lower():
            metadata["indication"] = indication.title()
            break

    # Try to identify sponsor/company
    sponsor_patterns = [
        "sponsored by", "Sponsor:", "Sponsor :", 
        "conducted by", "prepared by", "developed by"
    ]
    
    for pattern in sponsor_patterns:
        idx = text.lower().find(pattern.lower())
        if idx != -1:
            # Extract text after the pattern
            sponsor_text = text[idx + len(pattern):idx + len(pattern) + 100]
            # Find the first line break or period
            end_idx = min(
                sponsor_text.find("\n") if sponsor_text.find("\n") != -1 else 100,
                sponsor_text.find(".") if sponsor_text.find(".") != -1 else 100
            )
            if end_idx > 0:
                sponsor = sponsor_text[:end_idx].strip()
                if sponsor and len(sponsor) < 100:
                    metadata["sponsor"] = sponsor
                    break

    # Extract drug name if present
    drug_name_patterns = [
        "study drug", "investigational product", "drug name", "test drug", 
        "active substance", "drug product", "medication"
    ]
    
    for pattern in drug_name_patterns:
        idx = text.lower().find(pattern.lower())
        if idx != -1:
            # Extract text after the pattern
            drug_text = text[idx + len(pattern):idx + len(pattern) + 100]
            # Find potential drug name (often in quotes or after a colon)
            import re
            drug_matches = re.search(r'[:"]([^:"]{3,50})[:"]*', drug_text)
            if drug_matches:
                drug_name = drug_matches.group(1).strip()
                if drug_name and len(drug_name) < 50:
                    metadata["drugName"] = drug_name
                    break

    # Try to extract eligibility criteria
    inclusion_idx = text.lower().find("inclusion criteria")
    exclusion_idx = text.lower().find("exclusion criteria")
    
    if inclusion_idx != -1 or exclusion_idx != -1:
        criteria_text = ""
        
        if inclusion_idx != -1:
            # Extract 500 chars after inclusion criteria
            inclusion_text = text[inclusion_idx:inclusion_idx + 500]
            criteria_text += f"\nInclusion Criteria:\n{inclusion_text}\n"
            
        if exclusion_idx != -1:
            # Extract 500 chars after exclusion criteria
            exclusion_text = text[exclusion_idx:exclusion_idx + 500]
            criteria_text += f"\nExclusion Criteria:\n{exclusion_text}"
            
        metadata["eligibilityCriteria"] = criteria_text.strip()

    # Create a description from the first 200-300 characters of meaningful text
    valid_lines = [line for line in lines if len(line.strip()) > 20]
    if valid_lines:
        description_text = " ".join(valid_lines[:5])
        metadata["description"] = description_text[:300] + "..." if len(description_text) > 300 else description_text

    return metadata

def setup_database():
    """Ensure the SQLite database exists and has the correct schema"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Create tables if they don't exist
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS csr_metadata (
        csr_id TEXT PRIMARY KEY,
        title TEXT,
        indication TEXT,
        phase TEXT,
        sample_size INTEGER,
        outcome TEXT,
        file_name TEXT,
        file_size INTEGER,
        import_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        summary TEXT,
        
        nctrialId TEXT,
        drugName TEXT,
        source TEXT,
        status TEXT,
        description TEXT,
        eligibilityCriteria TEXT,
        file_path TEXT
    )
    ''')
    
    # Create indices for common search fields
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_indication ON csr_metadata(indication)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_phase ON csr_metadata(phase)')
    
    conn.commit()
    conn.close()
    logger.info(f"Database initialized at {DB_PATH}")

def save_csr_to_database(metadata: Dict[str, Any]) -> bool:
    """Save CSR metadata to SQLite database"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # We've already defined all columns in setup_database
        # Let's directly insert the data
        cursor.execute('''
        INSERT OR REPLACE INTO csr_metadata
        (csr_id, nctrialId, title, indication, phase, file_path, file_name, file_size, import_date, 
        drugName, source, status, description, eligibilityCriteria, sample_size)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            metadata.get('csr_id'),
            metadata.get('nctrialId'),
            metadata.get('title', ''),
            metadata.get('indication', ''),
            metadata.get('phase', ''),
            metadata.get('file_path', os.path.abspath(metadata.get('fileName', ''))),
            metadata.get('fileName', ''),
            metadata.get('fileSize', 0),
            datetime.now().isoformat(),
            metadata.get('drugName', ''),
            metadata.get('source', ''),
            metadata.get('status', ''),
            metadata.get('description', ''),
            metadata.get('eligibilityCriteria', ''),
            metadata.get('sampleSize', 0)
        ))
        
        conn.commit()
        conn.close()
        return True
        
    except Exception as e:
        logger.error(f"Error saving CSR to database: {e}")
        return False

def save_csr_to_file(metadata: Dict[str, Any]) -> bool:
    """Save CSR metadata to JSON file"""
    try:
        csr_id = metadata.get('csr_id')
        file_path = os.path.join(PROCESSED_CSR_DIR, f"{csr_id}.json")
        
        with open(file_path, 'w') as f:
            json.dump(metadata, f, indent=2)
            
        return True
        
    except Exception as e:
        logger.error(f"Error saving CSR to file: {e}")
        return False

def process_pdf(pdf_path: str) -> Optional[Dict[str, Any]]:
    """Process a single PDF file and return the extracted CSR data"""
    logger.info(f"Processing {pdf_path}")
    
    # Extract text
    text = extract_text_from_pdf(pdf_path)
    if not text:
        logger.warning(f"No text extracted from {pdf_path}")
        return None
        
    # Extract metadata
    metadata = extract_metadata_from_text(text, pdf_path)
    
    # Add full text
    metadata["full_text"] = text
    
    # Generate file path information
    file_path = os.path.abspath(pdf_path)
    metadata["file_path"] = file_path
    
    # Additional fields to match existing CSR format
    metadata["sampleSize"] = 0  # Initialize with 0 instead of None
    metadata["randomization"] = "Unknown"
    metadata["studyDesign"] = "Unknown"
    metadata["interventionalModel"] = "Unknown"
    metadata["primaryPurpose"] = "Unknown"
    metadata["maskingInfo"] = "Unknown"
    metadata["officialTitle"] = metadata.get("title", "")
    
    # Provide structured eligibility criteria if not already present
    if not metadata.get("eligibilityCriteria"):
        metadata["eligibilityCriteria"] = "No eligibility criteria extracted from document."
    
    # Ensure completionDate is present
    if not metadata.get("completionDate"):
        metadata["completionDate"] = metadata.get("date", datetime.now().strftime("%Y-%m-%d"))
    
    # Add source tracking
    metadata["source"] = f"PDF Document: {os.path.basename(pdf_path)}"
    
    return metadata

def import_pdfs(directory: str = PDF_SOURCE_DIR, limit: int = 0, offset: int = 0) -> int:
    """Import PDFs from directory into CSR database"""
    setup_database()
    
    # Get all PDF files
    pdf_files = glob.glob(os.path.join(directory, "*.pdf"))
    logger.info(f"Found {len(pdf_files)} PDF files in {directory}")
    
    # Apply offset and limit
    if offset > 0:
        pdf_files = pdf_files[offset:]
        logger.info(f"Starting from PDF #{offset}")
        
    if limit:
        pdf_files = pdf_files[:limit]
        logger.info(f"Processing {limit} PDFs (files {offset} to {offset+limit})")
    
    # Process each PDF
    successful = 0
    for pdf_path in pdf_files:
        try:
            # Process PDF
            metadata = process_pdf(pdf_path)
            if not metadata:
                continue
                
            # Save to database
            db_success = save_csr_to_database(metadata)
            
            # Save to file
            file_success = save_csr_to_file(metadata)
            
            if db_success and file_success:
                logger.info(f"Successfully imported {pdf_path}")
                successful += 1
                
        except Exception as e:
            logger.error(f"Error processing {pdf_path}: {e}")
            
        # Add a small delay to avoid overloading the system
        time.sleep(0.1)
    
    logger.info(f"Imported {successful} out of {len(pdf_files)} PDFs")
    return successful

def main():
    """Main entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Import PDFs to CSR database")
    parser.add_argument("--dir", default=PDF_SOURCE_DIR, help="Directory containing PDFs")
    parser.add_argument("--limit", type=int, help="Limit the number of PDFs to process")
    parser.add_argument("--offset", type=int, default=0, help="Skip the first N PDFs")
    
    args = parser.parse_args()
    
    # Make sure we can extract text from PDFs
    try:
        from pdfminer.high_level import extract_text
    except ImportError:
        logger.error("pdfminer.six is not installed. Please install it.")
        sys.exit(1)
    
    # Import PDFs
    import_pdfs(args.dir, args.limit, args.offset)

if __name__ == "__main__":
    main()