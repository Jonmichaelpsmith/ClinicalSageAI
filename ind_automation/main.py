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


# ---------- SAML (pySAML2) ----------
from fastapi.responses import RedirectResponse
@app.get('/saml/{org}/login')
async def saml_login(org: str, relay: str = '/'):
    url = saml_sp_pysaml2.login_redirect(org, relay)
    return RedirectResponse(url)

@app.post('/saml/{org}/acs')
async def saml_acs(org: str, request: Request):
    attrs, nameid = await saml_sp_pysaml2.acs_process(org, request)
    users.create(nameid, 'saml', role='user')
    perms = attrs.get('trialsage-perms', [])
    _d = users._load(); _d[nameid]['perms'] = perms; users._save(_d)
    token = auth.create_token(nameid)
    return RedirectResponse(f'/#/login-callback?token={token}')
