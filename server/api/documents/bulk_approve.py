"""
Bulk Document Approval API

This module provides endpoints for bulk approving documents, triggering QC checks,
and updating document status.
"""

import os
import json
import asyncio
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from sqlalchemy.orm import Session

# Import event bus for WebSocket updates
import sys
import os

# Add the parent directory to sys.path to allow absolute imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))
from utils.event_bus import EventBus

# Configure logging
logger = logging.getLogger(__name__)

# Initialize router
router = APIRouter()

# Event bus for WebSocket notifications
event_bus = EventBus()

# Document models
class DocumentApproval(BaseModel):
    """Model for document approval request"""
    document_id: str
    status: str = "pending"
    reason: Optional[str] = None
    
class BulkApprovalRequest(BaseModel):
    """Model for bulk approval request"""
    documents: List[DocumentApproval]
    run_qc: bool = True
    region: Optional[str] = None
    
class ApprovalResponse(BaseModel):
    """Model for approval response"""
    document_id: str
    status: str
    message: str
    qc_status: Optional[str] = None
    
class BulkApprovalResponse(BaseModel):
    """Model for bulk approval response"""
    status: str
    results: List[ApprovalResponse]
    message: str
    task_id: Optional[str] = None

# Mock document database (replace with real database in production)
documents_db = {}

# Simulate document QC check
async def run_document_qc(document_id: str, region: Optional[str] = None) -> Dict[str, Any]:
    """
    Run QC check on a document
    
    Args:
        document_id: ID of the document to check
        region: Optional region for region-specific checks
        
    Returns:
        Dict with QC results
    """
    # Simulate async processing time
    await asyncio.sleep(1.5)
    
    # Determine result based on document ID (for demo purposes)
    if document_id.endswith('_failing'):
        result = {
            "status": "failed",
            "errors": [
                {"code": "PDF001", "message": "Invalid PDF structure", "location": "page 2"},
                {"code": "META002", "message": "Missing metadata", "location": "document properties"}
            ],
            "warnings": [
                {"code": "FMT001", "message": "Inconsistent formatting", "location": "section 3.2"}
            ],
            "region_issues": []
        }
    elif document_id.endswith('_warning'):
        result = {
            "status": "warning",
            "errors": [],
            "warnings": [
                {"code": "FMT001", "message": "Inconsistent formatting", "location": "section 3.2"},
                {"code": "REF001", "message": "External reference not resolved", "location": "bibliography"}
            ],
            "region_issues": []
        }
    else:
        result = {
            "status": "passed",
            "errors": [],
            "warnings": [],
            "region_issues": []
        }
    
    # Add region-specific issues if applicable
    if region:
        if region == "EU" and (document_id.endswith('_1') or document_id.endswith('_warning')):
            result["region_issues"].append({
                "region": "EU",
                "code": "EU001",
                "message": "Missing EMA-required consent statement",
                "location": "section 1.3"
            })
        elif region == "JP" and (document_id.endswith('_2') or document_id.endswith('_failing')):
            result["region_issues"].append({
                "region": "JP",
                "code": "JP001",
                "message": "Missing PMDA-required patient notification",
                "location": "appendix 2"
            })
    
    # Publish QC update over WebSocket
    await event_bus.publish_async("qc_status_update", document_id, result["status"], {
        "errors": len(result["errors"]),
        "warnings": len(result["warnings"]),
        "region_issues": len(result["region_issues"]),
    })
    
    return result

# Background task for processing bulk approval
async def process_bulk_approval(documents: List[DocumentApproval], run_qc: bool, region: Optional[str] = None) -> List[ApprovalResponse]:
    """
    Process bulk document approval with optional QC
    
    Args:
        documents: List of documents to approve
        run_qc: Whether to run QC on the documents
        region: Optional region for region-specific validation
        
    Returns:
        List of approval results
    """
    results = []
    
    for doc in documents:
        # Start QC as soon as possible if requested
        qc_task = None
        if run_qc:
            # Publish "in_progress" status immediately
            await event_bus.publish_async("qc_status_update", doc.document_id, "in_progress")
            
            # Start QC check
            qc_task = asyncio.create_task(run_document_qc(doc.document_id, region))
        
        # Process approval
        try:
            # Update document status in database
            documents_db[doc.document_id] = {
                "status": doc.status,
                "updated_at": datetime.utcnow().isoformat(),
                "reason": doc.reason
            }
            
            # Wait for QC if running
            qc_result = None
            if qc_task:
                qc_result = await qc_task
                
            results.append(ApprovalResponse(
                document_id=doc.document_id,
                status="approved" if doc.status == "approved" else doc.status,
                message="Document successfully processed",
                qc_status=qc_result["status"] if qc_result else None
            ))
        except Exception as e:
            logger.error(f"Error processing document {doc.document_id}: {e}")
            results.append(ApprovalResponse(
                document_id=doc.document_id,
                status="error",
                message=f"Error processing document: {str(e)}",
                qc_status="error" if run_qc else None
            ))
            
            # Ensure QC is marked as failed if there was an error
            if run_qc:
                await event_bus.publish_async("qc_status_update", doc.document_id, "error", {
                    "message": str(e)
                })
    
    return results

# Bulk approval endpoint
@router.post("/api/documents/bulk-approve")
async def bulk_approve_documents(
    request: BulkApprovalRequest,
    background_tasks: BackgroundTasks
) -> BulkApprovalResponse:
    """
    Bulk approve documents with optional QC checks
    
    This endpoint:
    1. Updates document status (approve/reject)
    2. Optionally runs QC checks on documents
    3. Returns immediate response while processing continues in background
    4. Publishes QC status updates via WebSocket
    
    Args:
        request: Bulk approval request with document IDs and statuses
        background_tasks: FastAPI background tasks
        
    Returns:
        Immediate response with task ID for tracking
    """
    if not request.documents:
        raise HTTPException(status_code=400, detail="No documents provided")
    
    # Generate a task ID
    task_id = f"bulk_approve_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
    
    # Start background processing
    asyncio.create_task(process_bulk_approval(request.documents, request.run_qc, request.region))
    
    # Return immediate response
    return BulkApprovalResponse(
        status="processing",
        results=[],  # Empty results for immediate response
        message=f"Bulk approval started with {len(request.documents)} documents. QC checks: {request.run_qc}",
        task_id=task_id
    )