
import os
import sys
import PyPDF2
import json
import hashlib
from datetime import datetime
import logging

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("knowledge_ingestion.log"),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger('knowledge_ingestion')

# Directory settings
INPUT_DIR = 'attached_assets'
OUTPUT_DIR = 'data/processed_knowledge'
METADATA_DIR = 'data/knowledge_metadata'

# Ensure output directories exist
os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(METADATA_DIR, exist_ok=True)

def extract_text_from_pdf(file_path):
    """Extract text from a PDF file using PyPDF2."""
    try:
        with open(file_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            text = ""
            for page_num in range(len(reader.pages)):
                page = reader.pages[page_num]
                text += page.extract_text() + "\n"
            return text.strip()
    except Exception as e:
        logger.error(f"Error extracting text from {file_path}: {str(e)}")
        return ""

def process_pdf_file(file_path):
    """Process a PDF file and extract its contents."""
    file_name = os.path.basename(file_path)
    file_id = hashlib.md5(file_name.encode()).hexdigest()
    
    logger.info(f"Processing file: {file_name}")
    
    # Extract text content
    text_content = extract_text_from_pdf(file_path)
    
    if not text_content:
        logger.warning(f"No text content extracted from {file_name}")
        return None
    
    # Create metadata
    file_stats = os.stat(file_path)
    metadata = {
        "id": file_id,
        "filename": file_name,
        "source_path": file_path,
        "extraction_date": datetime.now().isoformat(),
        "file_size_bytes": file_stats.st_size,
        "file_modified_date": datetime.fromtimestamp(file_stats.st_mtime).isoformat(),
        "content_length": len(text_content),
        "content_type": "PDF"
    }
    
    # Save extracted text content
    content_file = os.path.join(OUTPUT_DIR, f"{file_id}.txt")
    with open(content_file, 'w', encoding='utf-8') as f:
        f.write(text_content)
    
    # Save metadata
    metadata_file = os.path.join(METADATA_DIR, f"{file_id}.json")
    with open(metadata_file, 'w', encoding='utf-8') as f:
        json.dump(metadata, f, indent=2)
    
    logger.info(f"Successfully processed: {file_name} -> {file_id}")
    return metadata

def process_directory(directory=INPUT_DIR):
    """Process all PDF files in the specified directory."""
    logger.info(f"Starting knowledge ingestion from {directory}")
    
    processed_files = []
    failed_files = []
    
    for root, _, files in os.walk(directory):
        for file in files:
            if file.lower().endswith('.pdf'):
                file_path = os.path.join(root, file)
                try:
                    metadata = process_pdf_file(file_path)
                    if metadata:
                        processed_files.append(metadata)
                except Exception as e:
                    logger.error(f"Failed to process {file}: {str(e)}")
                    failed_files.append({"file": file, "error": str(e)})
    
    # Save summary report
    summary = {
        "timestamp": datetime.now().isoformat(),
        "total_files_processed": len(processed_files),
        "total_files_failed": len(failed_files),
        "processed_files": processed_files,
        "failed_files": failed_files
    }
    
    with open(os.path.join(METADATA_DIR, "ingestion_summary.json"), 'w', encoding='utf-8') as f:
        json.dump(summary, f, indent=2)
    
    logger.info(f"Knowledge ingestion complete. Processed: {len(processed_files)}, Failed: {len(failed_files)}")
    return summary

if __name__ == "__main__":
    summary = process_directory()
    print(f"Successfully processed {summary['total_files_processed']} files.")
    print(f"Failed to process {summary['total_files_failed']} files.")
    print(f"Details have been saved to {os.path.join(METADATA_DIR, 'ingestion_summary.json')}")
