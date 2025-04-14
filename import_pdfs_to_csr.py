#!/usr/bin/env python3
"""
PDF to CSR Import
----------------
This script imports PDF files containing Clinical Study Reports (CSRs)
into the TrialSage database.

It handles:
1. Extracting text and metadata from PDFs
2. Creating CSR entries in the database
3. Generating structured CSR data
"""

import os
import sys
import time
import argparse
import logging
import json
import re
import sqlite3
from datetime import datetime
import random
from typing import Dict, List, Any, Optional, Tuple
import PyPDF2

# Constants
LOG_FILE = "pdf_importer.log"
DB_FILE = "csr_database.db"

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(LOG_FILE)
    ]
)
logger = logging.getLogger("pdf-importer")

# Try to import pdfminer.high_level if available
try:
    from pdfminer.high_level import extract_text as pdfminer_extract_text
    HAVE_PDFMINER = True
except ImportError:
    HAVE_PDFMINER = False
    logger.warning("pdfminer.high_level not available, using PyPDF2 for text extraction")

def extract_text_with_pdfminer(pdf_path: str) -> str:
    """Extract text from PDF using pdfminer"""
    if not HAVE_PDFMINER:
        raise ImportError("pdfminer.high_level not available")
    
    try:
        text = pdfminer_extract_text(pdf_path)
        return text
    except Exception as e:
        logger.error(f"Error extracting text with pdfminer: {e}")
        return ""

def extract_text_with_pypdf2(pdf_path: str) -> str:
    """Extract text from PDF using PyPDF2"""
    text = ""
    
    try:
        with open(pdf_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            
            # First, try to get metadata
            metadata = reader.metadata
            if metadata:
                for key, value in metadata.items():
                    if value:
                        text += f"{key}: {value}\n"
                text += "\n\n"
            
            # Then extract text from pages
            for page_num, page in enumerate(reader.pages):
                if page_num < 50:  # Limit to first 50 pages for speed
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n\n"
                else:
                    # Sample some pages from later in the document
                    if page_num % 20 == 0:  # Sample every 20th page
                        page_text = page.extract_text()
                        if page_text:
                            text += page_text + "\n\n"
        
        return text
    except Exception as e:
        logger.error(f"Error extracting text with PyPDF2: {e}")
        return ""

def extract_text_from_pdf(pdf_path: str) -> str:
    """Extract text from PDF, trying multiple methods"""
    # Try pdfminer first, if available (better quality)
    if HAVE_PDFMINER:
        try:
            text = extract_text_with_pdfminer(pdf_path)
            if text and len(text) > 100:  # Ensure we got meaningful text
                return text
        except Exception as e:
            logger.warning(f"pdfminer extraction failed: {e}")
    
    # Fall back to PyPDF2
    try:
        text = extract_text_with_pypdf2(pdf_path)
        if text:
            return text
    except Exception as e:
        logger.error(f"PyPDF2 extraction failed: {e}")
    
    return ""

def extract_csr_metadata(text: str, file_path: str) -> Dict[str, Any]:
    """Extract metadata from CSR text"""
    # Initialize metadata with defaults
    metadata = {
        'title': os.path.basename(file_path),
        'sponsor': None,
        'indication': None,
        'phase': None,
        'study_id': None,
        'drug_name': None,
        'protocol_number': None,
        'therapeutic_area': None,
        'source': 'imported',
        'file_path': file_path,
        'file_size': os.path.getsize(file_path) if os.path.exists(file_path) else 0,
        'summary': None
    }
    
    # Extract title (use filename if can't extract)
    title_match = re.search(r'(?:title|study title)[:\s]+(.*?)(?:\n|$)', text, re.IGNORECASE)
    if title_match:
        metadata['title'] = title_match.group(1).strip()
    
    # Extract sponsor
    sponsor_match = re.search(r'(?:sponsor|company|corporation)[:\s]+(.*?)(?:\n|$)', text, re.IGNORECASE)
    if sponsor_match:
        metadata['sponsor'] = sponsor_match.group(1).strip()
    
    # Extract indication
    indication_match = re.search(r'(?:indication|disease|condition)[:\s]+(.*?)(?:\n|$)', text, re.IGNORECASE)
    if indication_match:
        metadata['indication'] = indication_match.group(1).strip()
    
    # Extract phase
    phase_match = re.search(r'(?:phase|study phase)[:\s]+(?:phase\s*)?(I{1,3}V?|[1-4])', text, re.IGNORECASE)
    if phase_match:
        phase = phase_match.group(1).strip().upper()
        # Convert Roman numerals to numbers if needed
        if phase in ['I', '1']:
            metadata['phase'] = 'Phase 1'
        elif phase in ['II', '2']:
            metadata['phase'] = 'Phase 2'
        elif phase in ['III', '3']:
            metadata['phase'] = 'Phase 3'
        elif phase in ['IV', '4']:
            metadata['phase'] = 'Phase 4'
        else:
            metadata['phase'] = f"Phase {phase}"
    
    # Extract study ID or protocol number
    id_match = re.search(r'(?:study id|protocol number|protocol id)[:\s]+([\w\d\-\.]+)', text, re.IGNORECASE)
    if id_match:
        study_id = id_match.group(1).strip()
        metadata['study_id'] = study_id
        metadata['protocol_number'] = study_id
    
    # Extract drug name
    drug_match = re.search(r'(?:drug name|investigational product|study drug)[:\s]+([\w\d\-\.]+)', text, re.IGNORECASE)
    if drug_match:
        metadata['drug_name'] = drug_match.group(1).strip()
    
    # Try to determine therapeutic area from indication
    if metadata['indication']:
        indication = metadata['indication'].lower()
        if any(term in indication for term in ['cancer', 'tumor', 'oncology', 'carcinoma', 'lymphoma', 'leukemia']):
            metadata['therapeutic_area'] = 'Oncology'
        elif any(term in indication for term in ['cardiac', 'heart', 'cardiovascular', 'hypertension']):
            metadata['therapeutic_area'] = 'Cardiovascular'
        elif any(term in indication for term in ['diabetes', 'glucose', 'insulin']):
            metadata['therapeutic_area'] = 'Endocrinology'
        elif any(term in indication for term in ['liver', 'hepatic', 'gastro']):
            metadata['therapeutic_area'] = 'Gastroenterology'
        elif any(term in indication for term in ['neuro', 'brain', 'alzheimer', 'parkinson']):
            metadata['therapeutic_area'] = 'Neurology'
        elif any(term in indication for term in ['lung', 'pulmonary', 'respiratory', 'asthma', 'copd']):
            metadata['therapeutic_area'] = 'Respiratory'
        elif any(term in indication for term in ['skin', 'derma', 'psoriasis', 'eczema']):
            metadata['therapeutic_area'] = 'Dermatology'
        elif any(term in indication for term in ['kidney', 'renal']):
            metadata['therapeutic_area'] = 'Nephrology'
        elif any(term in indication for term in ['immune', 'arthritis', 'lupus']):
            metadata['therapeutic_area'] = 'Immunology'
        elif any(term in indication for term in ['infect', 'virus', 'bacteria']):
            metadata['therapeutic_area'] = 'Infectious Disease'
        else:
            metadata['therapeutic_area'] = 'Other'
    
    # Generate a summary
    summary_paragraphs = []
    
    # Look for abstract or summary section
    abstract_match = re.search(r'(?:abstract|summary|synopsis).*?(?:\n{2,}|$)(.*?)(?:\n{2,}|$)', text, re.IGNORECASE | re.DOTALL)
    if abstract_match and len(abstract_match.group(1).strip()) > 50:
        summary_paragraphs.append(abstract_match.group(1).strip())
    
    # Look for results section
    results_match = re.search(r'(?:results|outcome).*?(?:\n{2,}|$)(.*?)(?:\n{2,}|$)', text, re.IGNORECASE | re.DOTALL)
    if results_match and len(results_match.group(1).strip()) > 50:
        summary_paragraphs.append(results_match.group(1).strip())
    
    # Look for conclusion section
    conclusion_match = re.search(r'(?:conclusion).*?(?:\n{2,}|$)(.*?)(?:\n{2,}|$)', text, re.IGNORECASE | re.DOTALL)
    if conclusion_match and len(conclusion_match.group(1).strip()) > 50:
        summary_paragraphs.append(conclusion_match.group(1).strip())
    
    if summary_paragraphs:
        # Combine paragraphs and limit length
        metadata['summary'] = ' '.join(summary_paragraphs)[:1000]
    else:
        # Use first 500 characters as summary if nothing else found
        metadata['summary'] = text[:500].replace('\n', ' ').strip()
    
    return metadata

def extract_csr_details(text: str, metadata: Dict[str, Any]) -> Dict[str, Any]:
    """Extract detailed CSR information"""
    # Initialize details
    details = {
        'studyDesign': None,
        'primaryObjective': None,
        'secondaryObjectives': None,
        'studyDescription': None,
        'inclusionCriteria': None,
        'exclusionCriteria': None,
        'endpoints': [],
        'treatmentArms': [],
        'population': None,
        'results': None,
        'safety': None,
        'limitations': None,
        'conclusions': None
    }
    
    # Extract study design
    design_match = re.search(r'(?:study design|design).*?(?:\n{2,}|:)(.*?)(?:\n{2,}|$)', text, re.IGNORECASE | re.DOTALL)
    if design_match:
        details['studyDesign'] = design_match.group(1).strip()
    
    # Extract primary objective
    objective_match = re.search(r'(?:primary objective|objective).*?(?:\n{2,}|:)(.*?)(?:\n{2,}|$)', text, re.IGNORECASE | re.DOTALL)
    if objective_match:
        details['primaryObjective'] = objective_match.group(1).strip()
    
    # Extract secondary objectives
    secondary_match = re.search(r'(?:secondary objective).*?(?:\n{2,}|:)(.*?)(?:\n{2,}|$)', text, re.IGNORECASE | re.DOTALL)
    if secondary_match:
        details['secondaryObjectives'] = secondary_match.group(1).strip()
    
    # Extract study description
    description_match = re.search(r'(?:study description|description).*?(?:\n{2,}|:)(.*?)(?:\n{2,}|$)', text, re.IGNORECASE | re.DOTALL)
    if description_match:
        details['studyDescription'] = description_match.group(1).strip()
    
    # Extract inclusion criteria
    inclusion_match = re.search(r'(?:inclusion criteria).*?(?:\n{2,}|:)(.*?)(?:exclusion criteria|\n{4,}|$)', text, re.IGNORECASE | re.DOTALL)
    if inclusion_match:
        details['inclusionCriteria'] = inclusion_match.group(1).strip()
    
    # Extract exclusion criteria
    exclusion_match = re.search(r'(?:exclusion criteria).*?(?:\n{2,}|:)(.*?)(?:\n{4,}|$)', text, re.IGNORECASE | re.DOTALL)
    if exclusion_match:
        details['exclusionCriteria'] = exclusion_match.group(1).strip()
    
    # Extract endpoints
    endpoint_section = re.search(r'(?:endpoints|outcome measures).*?(?:\n{2,}|:)(.*?)(?:\n{4,}|$)', text, re.IGNORECASE | re.DOTALL)
    if endpoint_section:
        endpoint_text = endpoint_section.group(1)
        # Look for numbered or bulleted endpoints
        endpoint_items = re.findall(r'(?:^|\n)(?:\d+\.\s*|\*\s*|-\s*)(.*?)(?:\n|$)', endpoint_text)
        if endpoint_items:
            details['endpoints'] = [item.strip() for item in endpoint_items if len(item.strip()) > 5]
        else:
            # Split by sentences if no clear formatting
            sentences = re.split(r'\.(?:\s+|\n)', endpoint_text)
            details['endpoints'] = [s.strip() + '.' for s in sentences if len(s.strip()) > 5]
    
    # Extract treatment arms
    arms_section = re.search(r'(?:treatment arms|treatment groups|study arms).*?(?:\n{2,}|:)(.*?)(?:\n{4,}|$)', text, re.IGNORECASE | re.DOTALL)
    if arms_section:
        arms_text = arms_section.group(1)
        # Look for numbered or bulleted arms
        arm_items = re.findall(r'(?:^|\n)(?:\d+\.\s*|\*\s*|-\s*)(.*?)(?:\n|$)', arms_text)
        if arm_items:
            details['treatmentArms'] = [item.strip() for item in arm_items if len(item.strip()) > 5]
        else:
            # Split by sentences if no clear formatting
            sentences = re.split(r'\.(?:\s+|\n)', arms_text)
            details['treatmentArms'] = [s.strip() + '.' for s in sentences if len(s.strip()) > 5]
    
    # Extract population
    population_match = re.search(r'(?:population|study population|subjects).*?(?:\n{2,}|:)(.*?)(?:\n{4,}|$)', text, re.IGNORECASE | re.DOTALL)
    if population_match:
        details['population'] = population_match.group(1).strip()
    
    # Extract results
    results_match = re.search(r'(?:results|efficacy results).*?(?:\n{2,}|:)(.*?)(?:conclusion|safety|adverse|\n{4,}|$)', text, re.IGNORECASE | re.DOTALL)
    if results_match:
        details['results'] = results_match.group(1).strip()
    
    # Extract safety data
    safety_match = re.search(r'(?:safety|adverse events|adverse reactions).*?(?:\n{2,}|:)(.*?)(?:conclusion|\n{4,}|$)', text, re.IGNORECASE | re.DOTALL)
    if safety_match:
        details['safety'] = safety_match.group(1).strip()
    
    # Extract limitations
    limitations_match = re.search(r'(?:limitations|study limitations).*?(?:\n{2,}|:)(.*?)(?:conclusion|\n{4,}|$)', text, re.IGNORECASE | re.DOTALL)
    if limitations_match:
        details['limitations'] = limitations_match.group(1).strip()
    
    # Extract conclusions
    conclusions_match = re.search(r'(?:conclusion|conclusions).*?(?:\n{2,}|:)(.*?)(?:\n{4,}|$)', text, re.IGNORECASE | re.DOTALL)
    if conclusions_match:
        details['conclusions'] = conclusions_match.group(1).strip()
    
    return details

def init_database() -> sqlite3.Connection:
    """Initialize the database"""
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    # Create csr_reports table if it doesn't exist
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS csr_reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        sponsor TEXT,
        indication TEXT,
        phase TEXT,
        study_id TEXT,
        drug_name TEXT,
        protocol_number TEXT,
        therapeutic_area TEXT,
        source TEXT,
        file_path TEXT,
        file_size INTEGER,
        upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        summary TEXT,
        processed BOOLEAN DEFAULT FALSE
    )
    ''')
    
    # Create csr_details table if it doesn't exist
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS csr_details (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        report_id INTEGER,
        study_design TEXT,
        primary_objective TEXT,
        secondary_objectives TEXT,
        study_description TEXT,
        inclusion_criteria TEXT,
        exclusion_criteria TEXT,
        endpoints TEXT,
        treatment_arms TEXT,
        population TEXT,
        results TEXT,
        safety TEXT,
        limitations TEXT,
        conclusions TEXT,
        processed BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (report_id) REFERENCES csr_reports (id)
    )
    ''')
    
    conn.commit()
    return conn

def import_pdf_to_csr(pdf_path: str) -> bool:
    """Import a PDF file to the CSR database"""
    # Check if file exists
    if not os.path.exists(pdf_path):
        logger.error(f"File does not exist: {pdf_path}")
        return False
    
    # Check if it's a PDF
    if not pdf_path.lower().endswith('.pdf'):
        logger.error(f"File is not a PDF: {pdf_path}")
        return False
    
    try:
        # Extract text from PDF
        logger.info(f"Extracting text from {pdf_path}")
        
        text = extract_text_from_pdf(pdf_path)
        
        if not text:
            logger.error(f"Failed to extract text from {pdf_path}")
            return False
        
        # Extract metadata
        logger.info(f"Extracting metadata from text ({len(text)} characters)")
        metadata = extract_csr_metadata(text, pdf_path)
        
        # Extract details
        logger.info("Extracting detailed CSR information")
        details = extract_csr_details(text, metadata)
        
        # Initialize database
        conn = init_database()
        cursor = conn.cursor()
        
        # Check if this file has already been imported
        cursor.execute("SELECT id FROM csr_reports WHERE file_path = ?", (pdf_path,))
        existing = cursor.fetchone()
        
        if existing:
            logger.info(f"File already imported with ID {existing[0]}")
            
            # Update the existing record
            cursor.execute('''
            UPDATE csr_reports SET
                title = ?,
                sponsor = ?,
                indication = ?,
                phase = ?,
                study_id = ?,
                drug_name = ?,
                protocol_number = ?,
                therapeutic_area = ?,
                source = ?,
                file_size = ?,
                summary = ?
            WHERE id = ?
            ''', (
                metadata['title'],
                metadata['sponsor'],
                metadata['indication'],
                metadata['phase'],
                metadata['study_id'],
                metadata['drug_name'],
                metadata['protocol_number'],
                metadata['therapeutic_area'],
                metadata['source'],
                metadata['file_size'],
                metadata['summary'],
                existing[0]
            ))
            
            # Update details
            cursor.execute('''
            UPDATE csr_details SET
                study_design = ?,
                primary_objective = ?,
                secondary_objectives = ?,
                study_description = ?,
                inclusion_criteria = ?,
                exclusion_criteria = ?,
                endpoints = ?,
                treatment_arms = ?,
                population = ?,
                results = ?,
                safety = ?,
                limitations = ?,
                conclusions = ?
            WHERE report_id = ?
            ''', (
                details['studyDesign'],
                details['primaryObjective'],
                details['secondaryObjectives'],
                details['studyDescription'],
                details['inclusionCriteria'],
                details['exclusionCriteria'],
                json.dumps(details['endpoints']),
                json.dumps(details['treatmentArms']),
                details['population'],
                details['results'],
                details['safety'],
                details['limitations'],
                details['conclusions'],
                existing[0]
            ))
            
            report_id = existing[0]
        else:
            # Insert new record
            cursor.execute('''
            INSERT INTO csr_reports (
                title, sponsor, indication, phase, study_id, drug_name,
                protocol_number, therapeutic_area, source, file_path, file_size, summary
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                metadata['title'],
                metadata['sponsor'],
                metadata['indication'],
                metadata['phase'],
                metadata['study_id'],
                metadata['drug_name'],
                metadata['protocol_number'],
                metadata['therapeutic_area'],
                metadata['source'],
                pdf_path,
                metadata['file_size'],
                metadata['summary']
            ))
            
            report_id = cursor.lastrowid
            
            # Insert details
            cursor.execute('''
            INSERT INTO csr_details (
                report_id, study_design, primary_objective, secondary_objectives,
                study_description, inclusion_criteria, exclusion_criteria,
                endpoints, treatment_arms, population, results, safety, limitations, conclusions
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                report_id,
                details['studyDesign'],
                details['primaryObjective'],
                details['secondaryObjectives'],
                details['studyDescription'],
                details['inclusionCriteria'],
                details['exclusionCriteria'],
                json.dumps(details['endpoints']),
                json.dumps(details['treatmentArms']),
                details['population'],
                details['results'],
                details['safety'],
                details['limitations'],
                details['conclusions']
            ))
        
        conn.commit()
        conn.close()
        
        logger.info(f"Successfully imported CSR with ID {report_id}")
        return True
    except Exception as e:
        logger.error(f"Error importing PDF: {e}")
        return False

def process_directory(directory: str) -> Dict[str, Any]:
    """Process all PDF files in a directory"""
    if not os.path.isdir(directory):
        logger.error(f"Directory does not exist: {directory}")
        return {"status": "error", "message": f"Directory does not exist: {directory}"}
    
    # Get all PDF files in the directory
    pdf_files = [os.path.join(directory, f) for f in os.listdir(directory) 
                if f.lower().endswith('.pdf') and os.path.isfile(os.path.join(directory, f))]
    
    if not pdf_files:
        logger.warning(f"No PDF files found in {directory}")
        return {"status": "complete", "processed": 0, "success": 0, "failed": 0}
    
    logger.info(f"Found {len(pdf_files)} PDF files in {directory}")
    
    # Process each file
    total = len(pdf_files)
    success = 0
    failed = 0
    
    for pdf_file in pdf_files:
        logger.info(f"Processing {pdf_file}")
        
        if import_pdf_to_csr(pdf_file):
            success += 1
        else:
            failed += 1
    
    return {
        "status": "complete",
        "processed": total,
        "success": success,
        "failed": failed
    }

def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(description="Import PDF files to CSR database")
    parser.add_argument("pdf_path", help="Path to PDF file or directory")
    args = parser.parse_args()
    
    if os.path.isdir(args.pdf_path):
        result = process_directory(args.pdf_path)
        print("\nDirectory Processing Summary:")
        print("===========================")
        for key, value in result.items():
            print(f"{key}: {value}")
    else:
        success = import_pdf_to_csr(args.pdf_path)
        print(f"\nImport {'successful' if success else 'failed'}")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())