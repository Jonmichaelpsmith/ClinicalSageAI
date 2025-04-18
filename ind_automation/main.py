import io, datetime, uuid
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

from ind_automation.templates import render_form1571, render_form1572, render_form3674
from ind_automation import db
from ind_automation import module3, ai_narratives
from ind_automation.db import append_history, get_history

app = FastAPI(title="IND Automation Service v2")

# CORS (relax during dev)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- Models ----------
class ProjectMeta(BaseModel):
    project_id: str
    sponsor: str
    drug_name: str
    protocol: str
    pi_name: str
    pi_address: str
    nct_number: str | None = None
    ind_number: str | None = None
    serial_number: int = 0                # auto‑increments per submission
    created: str = datetime.date.today().isoformat()
    updated: str | None = None

# ---------- REST: Projects ----------
@app.get("/api/projects", response_model=List[ProjectMeta])
async def list_projects():
    return db.list_projects()

@app.post("/api/projects", response_model=ProjectMeta)
async def create_project(p: ProjectMeta):
    if db.load(p.project_id):
        raise HTTPException(400, "Project already exists")
    db.save(p.project_id, p.dict())
    return p

@app.put("/api/projects/{pid}", response_model=ProjectMeta)
async def update_project(pid: str, p: ProjectMeta):
    record = p.dict()
    record["updated"] = datetime.date.today().isoformat()
    db.save(pid, record)
    return p

@app.get("/api/projects/{pid}", response_model=ProjectMeta)
async def get_project(pid: str):
    rec = db.load(pid)
    if not rec: raise HTTPException(404, "Not found")
    return rec

# ---------- Utils ----------
def _doc(buf: io.BytesIO, fname: str):
    return StreamingResponse(
        buf,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": f'attachment; filename=\"{fname}\"'}
    )

def _get_meta(pid: str) -> ProjectMeta:
    rec = db.load(pid)
    if not rec: raise HTTPException(404, "Project not found")
    return ProjectMeta(**rec)

# ---------- Forms ----------
@app.get("/api/ind/{pid}/forms/1571")
async def get_1571(pid: str):
    m = _get_meta(pid)
    context = m.dict()
    context["submission_date"] = datetime.date.today().isoformat()
    buf = render_form1571(context)
    return _doc(buf, f"Form1571_{pid}.docx")

@app.get("/api/ind/{pid}/forms/1572")
async def get_1572(pid: str):
    m = _get_meta(pid)
    buf = render_form1572(m.dict())
    return _doc(buf, f"Form1572_{pid}.docx")

@app.get("/api/ind/{pid}/forms/3674")
async def get_3674(pid: str):
    m = _get_meta(pid)
    buf = render_form3674(m.dict())
    return _doc(buf, f"Form3674_{pid}.docx")

# ---------- Serial Number increment endpoint ----------
@app.post("/api/ind/{pid}/sequence")
async def new_sequence(pid: str):
    m = _get_meta(pid)
    m.serial_number += 1
    
    # save history entry
    append_history(pid, {
        "serial": f"{m.serial_number:04d}",
        "timestamp": datetime.datetime.utcnow().isoformat()
    })
    
    db.save(pid, m.dict())
    return {"serial_number": f"{m.serial_number:04d}"}

# ---------- Health ----------
@app.get("/health")
async def health(): return {"status": "ok"}

# ---------- History endpoint ----------
@app.get("/api/ind/{pid}/history")
async def get_history_endpoint(pid: str):
    return get_history(pid)

# ------------ Backward Compatibility -------------

# Include Module 3 router
app.include_router(module3.router)

# Include AI narratives router
app.include_router(ai_narratives.router)

# For compatibility with existing API calls
@app.get("/projects")
async def legacy_projects():
    projects = []
    for project in db.list_projects():
        projects.append({
            "id": project["project_id"],
            "name": f"{project['sponsor']} - {project['drug_name']}"
        })
    
    # Add fallback projects if none exist in the database
    if not projects:
        projects = [
            {"id": "P001", "name": "Oncology - New Cancer Drug"},
            {"id": "P002", "name": "Cardiovascular - Hypertension Treatment"}
        ]
    
    return {"projects": projects}