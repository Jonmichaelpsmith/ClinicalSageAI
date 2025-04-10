# 🧠 SagePlus | Run Script
# Helper script to run the SagePlus pipeline with common options

import os
import sys
import argparse
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger("SagePlus-Runner")

def check_environment():
    """Check if the environment is properly set up"""
    # Check for HF_API_KEY
    if not os.getenv("HF_API_KEY"):
        logger.error("❌ HF_API_KEY not found in environment variables!")
        logger.error("Please set HF_API_KEY in your .env file or environment.")
        return False
    return True

def main():
    """Main function to run the SagePlus pipeline"""
    parser = argparse.ArgumentParser(description="SagePlus CSR Processing Pipeline Runner")
    
    # Add command groups
    subparsers = parser.add_subparsers(dest="command", help="Command to run")
    
    # Test command
    test_parser = subparsers.add_parser("test", help="Run pipeline tests")
    
    # Process command
    process_parser = subparsers.add_parser("process", help="Process CSR PDFs")
    process_parser.add_argument("--input", "-i", default="csrs", help="Directory containing CSR PDFs")
    process_parser.add_argument("--database", "-db", action="store_true", help="Enable database integration")
    
    # Import command
    import_parser = subparsers.add_parser("import", help="Import existing vectors to database")
    
    # Parse arguments
    args = parser.parse_args()
    
    # Check environment
    if not check_environment():
        return 1
    
    # Execute requested command
    if args.command == "test":
        logger.info("Running pipeline tests...")
        from test_pipeline import test_pipeline
        success = test_pipeline()
        return 0 if success else 1
    
    elif args.command == "process":
        logger.info(f"Processing CSR PDFs from {args.input}...")
        from sage_plus_pipeline import SagePlusPipeline
        pipeline = SagePlusPipeline(use_db=args.database)
        pipeline.process_directory(args.input)
        return 0
    
    elif args.command == "import":
        logger.info("Importing existing vectors to database...")
        from sage_plus_pipeline import SagePlusPipeline
        pipeline = SagePlusPipeline(use_db=True)
        count = pipeline.import_existing_vectors()
        logger.info(f"Imported {count} vectors to database")
        return 0
    
    else:
        # No command specified, show help
        parser.print_help()
        return 0

if __name__ == "__main__":
    sys.exit(main())