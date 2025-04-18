import io, datetime
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from ingestion.benchling_connector import fetch_benchling_cmc
from ind_automation.templates import render_form1571, render_form1572, render_form3674

app = FastAPI(title="IND Automation Service")

# CORS for browser calls (tighten origins in prod)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------ Health ------------------
@app.get("/health")
async def health():
    return {"status": "ok", "timestamp": datetime.datetime.utcnow().isoformat()}

# ------------------ Project Metadata Model ------------------
class INDProject(BaseModel):
    project_id: str
    sponsor: str = "Acme Biotech, Inc."
    ind_number: str | None = "0000"
    drug_name: str = "TestDrug"
    protocol: str = "PROTO‑123"
    submission_date: str = datetime.date.today().isoformat()
    pi_name: str = "Dr Jane Doe"
    pi_address: str = "123 Lab St, Science City CA"
    nct_number: str | None = "NCT01234567"
    registration_status: str = "Registered"

# Demo in‑memory store
_demo_store: dict[str, INDProject] = {}

def fetch_project_metadata(pid: str) -> INDProject:
    if pid not in _demo_store:
        _demo_store[pid] = INDProject(project_id=pid)
    return _demo_store[pid]

# ------------------ Form Endpoints ------------------
def _doc_response(buf: io.BytesIO, fname: str):
    return StreamingResponse(
        buf,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": f'attachment; filename=\"{fname}\"'}
    )

@app.get("/api/ind/{pid}/forms/1571")
async def get_1571(pid: str):
    meta = fetch_project_metadata(pid)
    buf = render_form1571(meta.dict())
    return _doc_response(buf, f"Form1571_{pid}.docx")

@app.get("/api/ind/{pid}/forms/1572")
async def get_1572(pid: str):
    meta = fetch_project_metadata(pid)
    buf = render_form1572(meta.dict())
    return _doc_response(buf, f"Form1572_{pid}.docx")

@app.get("/api/ind/{pid}/forms/3674")
async def get_3674(pid: str):
    meta = fetch_project_metadata(pid)
    buf = render_form3674(meta.dict())
    return _doc_response(buf, f"Form3674_{pid}.docx")
