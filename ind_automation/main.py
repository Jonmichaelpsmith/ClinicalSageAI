import io, datetime, uuid
from fastapi import FastAPI, HTTPException, Depends
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Dict, Optional

from ind_automation.templates import render_form1571, render_form1572, render_form3674
from ind_automation import db
from ind_automation import module3, ai_narratives, metrics, ectd_ga, auth, users, rbac
from ind_automation.db import append_history, get_history
from ind_automation import esg_credentials_api
from ind_automation import saml_settings_api
from ind_automation import teams_webhook_api

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
    if body.alert_channels is not None: users.set_channels(username, body.alert_channels)
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

# Include Teams webhook API
app.include_router(teams_webhook_api.router)


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

# ---------- Compliance Rules Settings ----------
@app.get('/api/org/{org}/rules', dependencies=[Depends(rbac.requires('admin.esg'))])
async def get_rules(org:str):
    return rules_store.load(org)

@app.put('/api/org/{org}/rules', dependencies=[Depends(rbac.requires('admin.esg'))])
async def set_rules(org:str, body:UserUpdate):
    rules_store.save(org, body)
    append_history(org, {"type":"rule_change", "timestamp": datetime.datetime.utcnow().isoformat()})
    return {'status':'saved'}

# ---------- Compliance Metrics API ----------
@app.get('/api/org/{org}/metrics')
async def get_metrics(org:str, rule:str|None=None, limit:int=200, offset:int=0, from_:str|None=None, to:str|None=None):
    return metrics.load(org).to_dict(orient='records')

@app.get('/api/org/{org}/insights/pdf')
async def insights_pdf(org:str):
    return insights_pdf.insights_pdf_endpoint(org)

from fastapi.staticfiles import StaticFiles
app.mount('/files', StaticFiles(directory='public'), name='files')

# ---------- User / Permission management ----------
@app.get('/api/org/{org}/users', dependencies=[Depends(rbac.requires('admin.esg'))])
async def list_users(org:str):
    return users.all_users()

@app.post('/api/org/{org}/users', dependencies=[Depends(rbac.requires('admin.esg'))])
async def invite_user(org:str, body:UserUpdate):
    users.create(body['username'], body.get('password','changeme'), role=body.get('role','user'))
    users.set_permissions(body['username'], body.get('perms',[]))
    return {'status':'created'}

@app.put('/api/org/{org}/users/{username}', dependencies=[Depends(rbac.requires('admin.esg'))])
async from pydantic import BaseModel, conint
class UserUpdate(BaseModel):
    role:str|None=None
    perms:list[str]|None=None
    alert_channels:conint(ge=0,le=3)|None=None  # bitmask

def update_user(org:str, username:str, body:UserUpdate):
    if body.role: # quick role update
        data=users.all_users(); data[username]['role']=body['role']; users._save(data)
    if body.perms is not None:
        users.set_permissions(username, body['perms'])
    return {'status':'updated'}

@app.delete('/api/org/{org}/users/{username}', dependencies=[Depends(rbac.requires('admin.esg'))])
async def delete_user(org:str, username:str):
    data=users.all_users(); data.pop(username, None); users._save(data)
    return {'status':'deleted'}

from ind_automation import gdpr
from fastapi.responses import StreamingResponse

@app.get('/api/user/{username}/export')
async def user_export(username:str, user:str=Depends(auth.get_current_user)):
    if user!=username and users.get_role(user)!="admin": raise HTTPException(403)
    buf=gdpr.export_user(username)
    return StreamingResponse(buf,media_type='application/zip',headers={'Content-Disposition':f'attachment; filename={username}_export.zip'})

@app.post('/api/user/{username}/purge')
async def user_purge(username:str, user:str=Depends(auth.get_current_user)):
    if users.get_role(user)!="admin": raise HTTPException(403)
    gdpr.purge_user(username); return {'status':'scheduled'}

from ind_automation import pii_filter, db, users
from starlette.middleware.base import BaseHTTPMiddleware
import json, asyncio

class RedactionMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        if request.headers.get("content-type","").startswith("application/json"):
            body=await request.body()
            data=json.loads(body or "{}")
            redacted=False
            matches=[]

            def _clean(obj):
                nonlocal redacted,matches
                if isinstance(obj,str):
                    clean,hit=pii_filter.redact(obj)
                    matches+=hit
                    redacted|=bool(hit)
                    return clean
                if isinstance(obj,dict): 
                    return {k:_clean(v) for k,v in obj.items()}
                if isinstance(obj,list): 
                    return [_clean(v) for v in obj]
                return obj

            clean=_clean(data)
            if redacted:
                # replace request stream
                request._receive = lambda: {"type":"http.request","body":json.dumps(clean).encode()}
                user=request.headers.get("x-user", "unknown")
                db.append_history("system",{"type":"redaction","user":user,"matches":matches,"timestamp":datetime.datetime.utcnow().isoformat()})
        return await call_next(request)

app.add_middleware(RedactionMiddleware)
