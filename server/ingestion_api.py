"""
FDA Data Ingestion API
This module provides a FastAPI interface to ingest data from various FDA sources.
"""

from fastapi import FastAPI, HTTPException
import uvicorn
from typing import Optional, Dict, Any, List

# Import FDA data connectors
from ingestion.fda_faers import get_faers_cached
from ingestion.fda_device import get_device_complaints_cached
# EU Eudamed connector would be imported here

app = FastAPI(
    title="FDA Data Ingestion API",
    description="API for ingesting data from FDA FAERS, MAUDE, and EU EUDAMED",
    version="1.0.0"
)

@app.get("/")
async def root():
    """Root endpoint returning API information"""
    return {
        "name": "FDA Data Ingestion API",
        "version": "1.0.0",
        "endpoints": [
            "/api/ingest/drug/{ndc_code}",
            "/api/ingest/device/{device_code}",
            "/api/ingest/eu/{product_code}"
        ]
    }

@app.get("/api/ingest/drug/{identifier}")
async def ingest_drug_data(identifier: str, limit: Optional[int] = None) -> Dict[str, Any]:
    """
    Fetch drug adverse event data from FDA FAERS
    
    Args:
        identifier: NDC product code or drug name to search for
        limit: Optional limit on number of records returned
        
    Returns:
        Dictionary containing FAERS data
    """
    try:
        records = get_faers_cached(identifier)
        
        # Apply limit if specified
        if limit and limit > 0 and records:
            records = records[:limit]
        
        # Handle case when no records are found
        if not records:
            records = []
            
        return {
            "source": "FDA_FAERS",
            "drug_identifier": identifier,
            "count": len(records),
            "raw_data": {
                "meta": {
                    "disclaimer": "Data from FDA Adverse Event Reporting System (FAERS)",
                    "results": {
                        "skip": 0,
                        "limit": limit if limit else len(records),
                        "total": len(records)
                    }
                },
                "results": records
            }
        }
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"FAERS ingestion failed: {str(e)}")

@app.get("/api/ingest/device/{device_identifier}")
async def ingest_device_data(device_identifier: str) -> Dict[str, Any]:
    """
    Fetch device complaint data from FDA MAUDE
    
    Args:
        device_identifier: Device identifier or name to search for
        
    Returns:
        Dictionary containing MAUDE data
    """
    try:
        complaints = get_device_complaints_cached(device_identifier)
        
        # Handle case when no complaints are found
        if not complaints:
            complaints = []
            
        return {
            "source": "FDA_Device_MAUDE",
            "device_identifier": device_identifier,
            "count": len(complaints),
            "complaints": complaints
        }
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"MAUDE ingestion failed: {str(e)}")

@app.get("/api/ingest/eu/{product_code}")
async def ingest_eu_data(product_code: str) -> Dict[str, Any]:
    """
    Fetch product data from EU EUDAMED (stub for future implementation)
    
    Args:
        product_code: Product identifier to search for
        
    Returns:
        Dictionary containing EUDAMED data
    """
    # This is a placeholder for future EUDAMED integration
    # For now, return an empty result set
    return {
        "source": "EU_EUDAMED",
        "product_code": product_code,
        "count": 0,
        "message": "EUDAMED connector in development",
        "vigilance_reports": []
    }

if __name__ == "__main__":
    # Run the API server directly for testing
    uvicorn.run(app, host="0.0.0.0", port=3500)