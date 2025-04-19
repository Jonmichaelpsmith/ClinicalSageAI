# bulk_approve.py – approve many docs + run QC in parallel
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import datetime
from server.db import SessionLocal
from server.models.document import Document
from server.utils.pdf_qc import qc_pdf
from server.utils.event_bus import publish

router = APIRouter(prefix="/api/documents", tags=["documents"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class BulkBody(BaseModel):
    ids: list[int]

@router.post("/bulk-approve")
async def bulk_approve(body: BulkBody, db: Session = Depends(get_db)):
    if not body.ids:
        raise HTTPException(status_code=400, detail="No document IDs provided")

    results = []
    for doc_id in body.ids:
        doc = db.query(Document).filter_by(id=doc_id).first()
        if not doc:
            results.append({"id": doc_id, "status": "missing"})
            continue

        # skip if already approved
        if doc.status == "approved":
            results.append({"id": doc_id, "status": "already"})
            continue

        report = qc_pdf(doc.path)
        doc.qc_json = report
        if report["status"] == "passed":
            doc.status = "approved"
            doc.approved_at = datetime.utcnow()
            db.add(doc)
            publish("qc", {"id": doc_id, "status": "passed"})
            results.append({"id": doc_id, "status": "approved"})
        else:
            doc.status = "qc_failed"
            db.add(doc)
            publish("qc", {"id": doc_id, "status": "failed"})
            results.append({"id": doc_id, "status": "failed", "errors": report["errors"]})

    db.commit()
    return {"updated": len(results), "results": results}