"""
FastAPI Ingestion Endpoints for CER data sources
"""
from fastapi import FastAPI, APIRouter, HTTPException
from .ingestion.fda_device import fetch_fda_device_complaints
from .ingestion.fda_faers import fetch_faers_data
from .ingestion.eu_eudamed import fetch_eudamed_data

app = FastAPI(title="TrialSage CER Data Ingestion API", 
              description="API endpoints to fetch regulatory data from various sources")

ingest_router = APIRouter(prefix="/api/ingest", tags=["ingestion"])

@ingest_router.get("/device/{device_code}")
async def ingest_device(device_code: str):
    """
    Fetch FDA device complaints data for a given device code
    """
    try:
        complaints = fetch_fda_device_complaints(device_code)
        return {"source": "FDA_Device", "device_code": device_code, "complaints": complaints}
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to fetch FDA device complaints: {e}")

@ingest_router.get("/drug/{ndc_code}")
async def ingest_drug(ndc_code: str, limit: int = 100):
    """
    Fetch FDA FAERS data for a given NDC code
    """
    try:
        data = fetch_faers_data(ndc_code, limit)
        return {"source": "FDA_FAERS", "ndc_code": ndc_code, "raw_data": data}
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to fetch FAERS data: {e}")

@ingest_router.get("/eu/{device_code}")
async def ingest_eu(device_code: str):
    """
    Fetch EU Eudamed data for a given device code
    """
    try:
        data = fetch_eudamed_data(device_code)
        return {"source": "EU_Eudamed", "device_code": device_code, "data": data}
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to fetch EU Eudamed data: {e}")

app.include_router(ingest_router)