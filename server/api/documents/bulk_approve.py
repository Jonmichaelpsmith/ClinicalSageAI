from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, conlist
from sqlalchemy.orm import Session
from server.db import SessionLocal
from utils.pdf_qc import qc_pdf
from utils.event_bus import publish
from server.models.document import Document
from datetime import datetime

router = APIRouter(prefix="/api/documents", tags=["documents"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class BulkBody(BaseModel):
    ids: conlist(int, min_items=1)

@router.post("/bulk-approve")
async def bulk_approve(body: BulkBody, db: Session = Depends(get_db)):
    updated = []
    for doc_id in body.ids:
        doc = db.query(Document).filter_by(id=doc_id).first()
        if not doc:
            continue
        report = qc_pdf(doc.path)
        doc.qc_json = report
        if report['status'] == 'passed':
            doc.status = 'approved'
            doc.approved_at = datetime.utcnow()
        else:
            doc.status = 'qc_failed'
        db.add(doc)
        updated.append({"id": doc.id, "status": doc.status})
        publish("qc", {"id": doc.id, "status": doc.status})
    db.commit()
    return {"updated": len(updated)}