#!/usr/bin/env python
"""
CER Generator Script for LumenTrialGuide.AI

This script provides a simple command-line interface to generate Clinical Evaluation Reports
from regulatory data sources. It's designed to be called from the web application.
"""

import os
import sys
import json
import argparse
import logging
from datetime import datetime
import asyncio
import traceback

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("cer_generator")

# Ensure we can import modules from the server directory
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.append(current_dir)
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.append(parent_dir)

try:
    # Import the CER generator functions
    from server.simple_cer_generator import generate_cer
except ImportError as e:
    logger.error(f"Failed to import required modules: {e}")
    logger.error(traceback.format_exc())
    sys.exit(1)

async def main():
    """
    Main entry point for the CER generator script
    """
    parser = argparse.ArgumentParser(description="Generate Clinical Evaluation Report")
    parser.add_argument("--id", required=True, help="Product ID (NDC or device code)")
    parser.add_argument("--name", required=True, help="Product name")
    parser.add_argument("--manufacturer", help="Manufacturer name")
    parser.add_argument("--description", help="Device description")
    parser.add_argument("--purpose", help="Intended purpose")
    parser.add_argument("--class", dest="classification", help="Device classification")
    parser.add_argument("--days", type=int, default=730, help="Date range in days")
    parser.add_argument("--format", choices=["pdf", "json"], default="pdf", help="Output format")
    
    args = parser.parse_args()
    
    try:
        # Generate the CER
        result = await generate_cer(
            product_id=args.id,
            product_name=args.name,
            manufacturer=args.manufacturer,
            device_description=args.description,
            intended_purpose=args.purpose,
            classification=args.classification,
            date_range=args.days,
            output_format=args.format
        )
        
        # Print result details for the calling process to parse
        print(f"CER generated successfully:")
        print(f"  Product: {result['product_name']} (ID: {result['product_id']})")
        print(f"  Report date: {result['report_date']}")
        print(f"  Format: {result['format']}")
        print(f"  Output file: {result['path']}")
        
        sys.exit(0)
    except Exception as e:
        logger.error(f"Error generating CER: {e}")
        logger.error(traceback.format_exc())
        print(f"Error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())