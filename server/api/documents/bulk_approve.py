"""
Enhanced bulk_approve.py – Handles bulk document approval with region-specific validation
Includes:
1. Region-aware validation profiles
2. Parallel processing in batches
3. WebSocket progress updates
4. Detailed validation error reporting
"""
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from pydantic import BaseModel, conlist, Field
from sqlalchemy.orm import Session
from datetime import datetime
import asyncio
import json
from server.db import SessionLocal
from server.models.document import Document
from utils.pdf_qc import qc_pdf
from utils.event_bus import publish
from utils.validator_manager import get_validator_for_region

router = APIRouter(prefix="/api/documents", tags=["documents"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class BulkBody(BaseModel):
    ids: conlist(int, min_items=1)
    region: str = Field(default="FDA", description="Regulatory region for validation (FDA, EMA, PMDA)")
    profile: Optional[str] = Field(None, description="Specific validation profile to use (FDA_eCTD_3.2.2, EU_eCTD_3.2.2, JP_eCTD_4.0)")
    batch_size: int = Field(default=5, description="Number of documents to process in parallel")

async def process_document(doc_id: int, region: str, db: Session, profile: Optional[str] = None) -> Dict[str, Any]:
    """Process a single document with region-specific validation
    
    Args:
        doc_id: Document ID to process
        region: Regulatory region (FDA, EMA, PMDA) 
        db: Database session
        profile: Optional specific validation profile to use
    """
    doc = db.query(Document).filter_by(id=doc_id).first()
    if not doc:
        result = {"id": doc_id, "status": "failed", "error": "Document not found"}
        publish('qc_status', {
            "documentId": doc_id,
            "status": "failed", 
            "details": "Document not found"
        })
        return result
    
    # Determine display profile name
    display_profile = profile or f"{region} standard profile"
    
    # First update status to processing
    publish('qc_status', {
        "documentId": doc_id,
        "status": "processing",
        "details": f"Processing with {display_profile}",
        "profile": profile
    })
    
    try:
        # Get the appropriate validator for the region
        validator = get_validator_for_region(region, profile)
        
        # Run QC with the region-specific validator
        report = qc_pdf(doc.path, validator=validator)
        
        # Record the validation profile used
        if not isinstance(report, dict):
            report = {"status": "failed", "details": "Invalid QC report format"}
        
        # Use the specified profile or fallback to region
        report["profile"] = profile or region
        report["timestamp"] = datetime.utcnow().isoformat()
        
        # Update document with QC results
        doc.qc_json = report
        
        # Determine status based on QC results
        if report.get('status') != 'passed':
            doc.status = 'qc_failed'
            db.add(doc)
            db.commit()
            
            # Send detailed failure report via WebSocket
            publish('qc_status', {
                "documentId": doc_id,
                "status": "failed",
                "details": report.get('details', 'Validation failed'),
                "errors": report.get('errors', []),
                "warnings": report.get('warnings', []),
                "profile": region,
                "timestamp": report["timestamp"]
            })
            
            return {"id": doc_id, "status": "failed", "error": 'qc_failed', "details": report}
        
        # If QC passed, update document status
        doc.status = 'approved'
        doc.approved_at = datetime.utcnow()
        db.add(doc)
        db.commit()
        
        # Send success notification via WebSocket
        publish('qc_status', {
            "documentId": doc_id,
            "status": "passed",
            "details": f"Passed {region} validation",
            "warnings": report.get('warnings', []),
            "profile": region,
            "timestamp": report["timestamp"]
        })
        
        return {"id": doc_id, "status": "passed"}
        
    except Exception as e:
        error_message = str(e)
        # Send error notification via WebSocket
        publish('qc_status', {
            "documentId": doc_id,
            "status": "failed",
            "details": f"Error: {error_message}",
            "profile": region,
            "timestamp": datetime.utcnow().isoformat()
        })
        
        return {"id": doc_id, "status": "failed", "error": error_message}

async def process_batch(doc_ids: List[int], region: str, db: Session, profile: Optional[str] = None) -> List[Dict[str, Any]]:
    """Process a batch of documents concurrently
    
    Args:
        doc_ids: List of document IDs to process
        region: Regulatory region (FDA, EMA, PMDA)
        db: Database session
        profile: Optional specific validation profile to use
    """
    tasks = [process_document(doc_id, region, db, profile) for doc_id in doc_ids]
    return await asyncio.gather(*tasks)

async def bulk_approval_task(body: BulkBody, background_tasks: BackgroundTasks):
    """Background task for processing documents in batches"""
    region = body.region
    profile = body.profile
    batch_size = min(body.batch_size, 10)  # Limit batch size to 10 for server health
    
    doc_ids = body.ids
    total_docs = len(doc_ids)
    processed = 0
    approved = []
    failed = []
    
    # Create a new database session for background processing
    db = SessionLocal()
    
    try:
        # Process documents in batches
        for i in range(0, total_docs, batch_size):
            batch_ids = doc_ids[i:i+batch_size]
            results = await process_batch(batch_ids, region, db, profile)
            
            # Collect results
            for result in results:
                processed += 1
                if result.get("status") == "passed":
                    approved.append(result["id"])
                else:
                    failed.append({"id": result["id"], "error": result.get("error", "Unknown error")})
                
                # Publish progress update after each batch
                progress_pct = int((processed / total_docs) * 100)
                publish('bulk_qc_summary', {
                    "type": "bulk_qc_summary",
                    "total": total_docs,
                    "processed": processed,
                    "passed": len(approved),
                    "failed": len(failed),
                    "progress": progress_pct,
                    "region": region,
                    "profile": profile
                })
    
    except Exception as e:
        # If the entire batch process fails, send failure notice
        publish('bulk_qc_error', {
            "type": "bulk_qc_error",
            "error": str(e),
            "region": region
        })
    finally:
        # Always close the DB session
        db.close()
    
    # Send final summary
    publish('bulk_qc_summary', {
        "type": "bulk_qc_summary",
        "total": total_docs,
        "processed": processed,
        "passed": len(approved),
        "failed": len(failed),
        "progress": 100,
        "region": region,
        "profile": profile,
        "complete": True
    })
    
    return {"approved": approved, "failed": failed}

@router.post("/bulk-approve")
async def bulk_approve(body: BulkBody, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """Endpoint to start bulk approval process with region-specific validation"""
    # Validate input
    if not body.ids:
        raise HTTPException(status_code=400, detail="No document IDs provided")
    
    # Validate region
    valid_regions = ["FDA", "EMA", "PMDA"]
    if body.region not in valid_regions:
        raise HTTPException(status_code=400, detail=f"Invalid region. Must be one of: {', '.join(valid_regions)}")
    
    # Start background processing
    background_tasks.add_task(bulk_approval_task, body, background_tasks)
    
    # Return immediate response
    return {
        "message": f"Bulk approval initiated for {len(body.ids)} documents using {body.region} validation rules",
        "total": len(body.ids),
        "region": body.region
    }