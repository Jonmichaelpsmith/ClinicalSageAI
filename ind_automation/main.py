import io, datetime, uuid
from fastapi import FastAPI, HTTPException, Depends
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Dict, Optional

from ind_automation.templates import render_form1571, render_form1572, render_form3674
from ind_automation import db
from ind_automation import module3, ai_narratives, ectd_ga, auth, users, rbac
from ind_automation.db import append_history, get_history
from ind_automation import esg_credentials_api
from ind_automation import saml_settings_api

app = FastAPI(title="IND Automation Service v2")

# Security
security = HTTPBearer()

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

# Include ESG credentials API
app.include_router(esg_credentials_api.router)

# Include SAML settings API
app.include_router(saml_settings_api.router)

# ---------- Auth routes ----------
from fastapi import Depends
@app.post("/api/auth/register")
async def register(body: dict):
    try:
        users.create(body["username"], body["password"], role=body.get("role","user"))
        return {"status":"created"}
    except ValueError as e:
        if str(e) == "exists":
            raise HTTPException(400, "Username already exists")
        raise HTTPException(400, str(e))

@app.post("/api/auth/login")
async def login(body: dict):
    if users.verify(body["username"], body["password"]):
        token = auth.create_token(body["username"])
        return {"token": token, "username": body["username"], "role": users.get_role(body["username"])}
    raise HTTPException(401, "Bad credentials")

@app.get("/api/auth/verify")
async def verify_token(user: str = Depends(auth.get_current_user)):
    """Verify that the token is valid"""
    return {"username": user, "role": users.get_role(user)}

@app.get("/api/ind-automation/auth/check-permissions")
async def check_permissions(user: str = Depends(auth.get_current_user)):
    """Get user permissions for client-side UI decisions"""
    role = users.get_role(user)
    permissions = []
    
    # Add permissions based on role
    if role == "admin":
        permissions.extend([
            "saml.read", 
            "saml.write", 
            "saml.delete",
            "esg.read",
            "esg.write"
        ])
    elif role == "manager":
        permissions.extend([
            "saml.read",
            "esg.read"
        ])
        
    return {"username": user, "role": role, "permissions": permissions}

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
@app.get("/api/ind/{pid}/ectd/{serial}")
async def build_ectd_ga(pid: str, serial: str):
    meta = db.load(pid)
    if not meta:
        raise HTTPException(404, "Project not found")
    zip_buf = ectd_ga.build_sequence(pid, serial)
    db.append_history(pid, {
        "type": "ectd_ga",
        "serial": serial,
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "zip": f"ectd_{pid}_{serial}.zip"
    })
    return StreamingResponse(zip_buf,
        media_type="application/zip",
        headers={"Content-Disposition": f"attachment; filename=ectd_{pid}_{serial}.zip"})
