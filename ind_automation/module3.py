import io
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from typing import Dict
from docxtpl import DocxTemplate

from ingestion.benchling_connector import fetch_benchling_cmc
from ind_automation.db import load as load_meta

TEMPLATE_PATH = "templates/module3_cmc.docx.j2"
router = APIRouter(prefix="/api/ind")

def _render(data: Dict, project_id: str):
    tpl = DocxTemplate(TEMPLATE_PATH)
    tpl.render(data)
    buf = io.BytesIO(); tpl.save(buf); buf.seek(0)
    return StreamingResponse(
        buf,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": f'attachment; filename=Module3_{project_id}.docx'}
    )

@router.get("/{pid}/module3")
async def module3_benchling(pid: str, src: str = "benchling"):
    if src != "benchling":
        raise HTTPException(400, "src must be 'benchling'")

    meta = load_meta(pid) or {}
    bench = fetch_benchling_cmc(pid)
    if not bench:
        raise HTTPException(404, "Benchling data not found")

    bench.update(meta)  # merge sponsor/drug if needed
    return _render(bench, pid)

@router.post("/{pid}/module3/manual")
async def module3_manual(pid: str, payload: Dict):
    if not payload.get("drug_name"):
        raise HTTPException(400, "drug_name required")
    return _render(payload, pid)