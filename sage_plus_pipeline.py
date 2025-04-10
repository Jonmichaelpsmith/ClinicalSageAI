# 🧠 SagePlus | Complete CSR Processing Pipeline Runner
# Orchestrates the entire CSR processing pipeline from extraction to database storage

import os
import argparse
import logging
from typing import List, Dict, Any
import time
import json
from dotenv import load_dotenv

# Import our pipeline components
from csr_extractor import extract_text_from_pdf, extract_structured_data
from csr_vectorizer import generate_summary_text, get_embedding
# Conditionally import database if MongoDB is available
try:
    from csr_database import CSRDatabase
    has_mongodb = True
except ImportError:
    has_mongodb = False
    
# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("sage_plus_pipeline.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("SagePlus")

# Load environment variables
load_dotenv()

class SagePlusPipeline:
    """Main pipeline orchestrator for SagePlus CSR processing"""
    
    def __init__(self, use_db=False):
        """Initialize the pipeline"""
        self.use_db = use_db and has_mongodb
        if self.use_db:
            self.db = CSRDatabase()
        
        # Create necessary directories
        os.makedirs("csrs", exist_ok=True)
        os.makedirs("csr_json", exist_ok=True)
        os.makedirs("csr_vectors", exist_ok=True)
        
        # Check for Hugging Face API key
        self.hf_api_key = os.getenv("HF_API_KEY")
        if not self.hf_api_key:
            logger.warning("⚠️ HF_API_KEY not found in environment! Pipeline will not work without it.")
    
    def process_pdf(self, pdf_path: str) -> Dict[str, Any]:
        """Process a single PDF through the entire pipeline"""
        filename = os.path.basename(pdf_path)
        logger.info(f"🔍 Processing PDF: {filename}")
        
        # Step 1: Extract text from PDF
        logger.info("Extracting text from PDF...")
        text = extract_text_from_pdf(pdf_path)
        
        # Step 2: Extract structured data from text using LLM
        logger.info("Extracting structured data from text...")
        data = extract_structured_data(text)
        
        # Add filename and path info to the data
        data['file_name'] = filename
        data['file_path'] = pdf_path
        
        # Save the extracted JSON data
        json_output_path = os.path.join("csr_json", os.path.splitext(filename)[0] + ".json")
        with open(json_output_path, "w") as f:
            json.dump(data, f, indent=2)
        logger.info(f"✅ Saved structured data to {json_output_path}")
        
        # Step 3: Generate summary and embedding
        logger.info("Generating text summary...")
        summary = generate_summary_text(data)
        if summary:
            data['text_summary'] = summary
            
            logger.info("Generating vector embeddings...")
            embedding = get_embedding(summary)
            if embedding:
                data['embedding'] = embedding
                
                # Save the vectorized data
                vector_output_path = os.path.join("csr_vectors", os.path.splitext(filename)[0] + ".json")
                with open(vector_output_path, "w") as f:
                    json.dump(data, f, indent=2)
                logger.info(f"✅ Saved vectorized data to {vector_output_path}")
                
                # Step 4: Store in database if enabled
                if self.use_db:
                    logger.info("Storing in database...")
                    csr_id = self.db.store_csr_data(data)
                    if csr_id and embedding:
                        self.db.store_vector_data(csr_id, summary, embedding)
                        logger.info(f"✅ Stored in database with ID: {csr_id}")
        
        return data
    
    def process_directory(self, input_dir: str = "csrs") -> List[Dict[str, Any]]:
        """Process all PDFs in a directory"""
        results = []
        pdf_files = [f for f in os.listdir(input_dir) if f.lower().endswith('.pdf')]
        
        logger.info(f"🚀 Starting batch processing of {len(pdf_files)} PDF files...")
        
        for i, filename in enumerate(pdf_files):
            pdf_path = os.path.join(input_dir, filename)
            try:
                logger.info(f"Processing file {i+1} of {len(pdf_files)}: {filename}")
                result = self.process_pdf(pdf_path)
                results.append(result)
                
                # Add a small delay to avoid rate limiting
                if i < len(pdf_files) - 1:
                    logger.info("Pausing to avoid rate limits...")
                    time.sleep(2)
                    
            except Exception as e:
                logger.error(f"❌ Error processing {filename}: {str(e)}", exc_info=True)
        
        logger.info(f"✅ Completed processing {len(results)} out of {len(pdf_files)} files successfully")
        return results
    
    def import_existing_vectors(self) -> int:
        """Import existing vector files into the database"""
        if not self.use_db:
            logger.warning("Database integration not enabled. Skipping import.")
            return 0
            
        logger.info("Importing existing vector files into database...")
        count = self.db.import_from_json_files("csr_vectors")
        logger.info(f"✅ Imported {count} files into the database")
        return count
        
def main():
    """Main function to run the pipeline"""
    parser = argparse.ArgumentParser(description="SagePlus CSR Processing Pipeline")
    parser.add_argument("--input", "-i", default="csrs", help="Directory containing CSR PDFs")
    parser.add_argument("--database", "-db", action="store_true", help="Enable database integration")
    parser.add_argument("--import-only", action="store_true", help="Only import existing vectors to database")
    args = parser.parse_args()
    
    # Check for HF API key
    if not os.getenv("HF_API_KEY"):
        print("⚠️  WARNING: HF_API_KEY environment variable not set!")
        print("The pipeline requires a Hugging Face API key to function.")
        print("Please set the HF_API_KEY environment variable and try again.")
        return
    
    pipeline = SagePlusPipeline(use_db=args.database)
    
    if args.import_only:
        pipeline.import_existing_vectors()
    else:
        pipeline.process_directory(args.input)
        
    logger.info("✨ SagePlus pipeline completed")

if __name__ == "__main__":
    main()