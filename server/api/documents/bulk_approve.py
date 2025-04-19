"""
Bulk Document Approval API

This module provides endpoints for approving multiple documents at once
and emitting WebSocket notifications for real-time updates.
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, conlist
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Dict, Any, Optional

from ...db import SessionLocal
from ...models.document import Document
from ...utils.pdf_qc import qc_pdf
from ...utils.event_bus import publish

router = APIRouter(prefix="/api/documents", tags=["documents"])

def get_db():
    """Database session dependency"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class BulkApproveRequest(BaseModel):
    """Request body for bulk approval"""
    ids: conlist(int, min_items=1)

class ApprovalResult(BaseModel):
    """Result of an individual document approval"""
    id: int
    status: str
    errors: Optional[List[Dict[str, Any]]] = None

class BulkApproveResponse(BaseModel):
    """Response for bulk approval"""
    results: List[ApprovalResult]

@router.post("/bulk-approve", response_model=BulkApproveResponse)
async def bulk_approve(body: BulkApproveRequest, db: Session = Depends(get_db)):
    """
    Approve multiple documents at once
    
    Args:
        body: Request containing document IDs to approve
        db: Database session
        
    Returns:
        Dictionary with results of each document approval
    """
    results = []
    
    for doc_id in body.ids:
        try:
            # Get document from database
            doc = db.query(Document).filter(Document.id == doc_id).first()
            
            if not doc:
                results.append(ApprovalResult(
                    id=doc_id,
                    status="error",
                    errors=[{"message": f"Document with ID {doc_id} not found"}]
                ))
                continue
            
            # Run QC check on document
            qc_report = qc_pdf(doc.path)
            doc.qc_json = qc_report
            
            # Update document status based on QC result
            if qc_report['status'] == 'passed':
                doc.status = 'approved'
                doc.approved_at = datetime.utcnow()
                
                # Publish QC event for WebSocket
                publish("qc", {
                    "id": doc_id, 
                    "status": "passed", 
                    "documentId": doc_id
                })
                
                results.append(ApprovalResult(
                    id=doc_id,
                    status="approved"
                ))
            else:
                doc.status = 'qc_failed'
                
                # Publish QC event for WebSocket
                publish("qc", {
                    "id": doc_id, 
                    "status": "failed", 
                    "documentId": doc_id,
                    "errors": qc_report['errors']
                })
                
                results.append(ApprovalResult(
                    id=doc_id,
                    status="qc_failed",
                    errors=qc_report['errors']
                ))
            
            # Save document changes
            db.add(doc)
        
        except Exception as e:
            results.append(ApprovalResult(
                id=doc_id,
                status="error",
                errors=[{"message": str(e)}]
            ))
    
    # Commit all changes
    db.commit()
    
    return {"results": results}