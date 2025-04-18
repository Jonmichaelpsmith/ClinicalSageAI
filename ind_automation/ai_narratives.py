import io, os, datetime
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from docxtpl import DocxTemplate
from openai import OpenAI
from ind_automation.db import load as load_meta, append_history

OPENAI_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_KEY:
    raise RuntimeError("Set OPENAI_API_KEY env var in Replit Secrets")

client = OpenAI(api_key=OPENAI_KEY)
router = APIRouter(prefix="/api/ind")
TEMPLATE = "templates/module2_summary.docx.j2"  # single generic template

PROMPTS = {
    "quality": "You are an FDA regulatory writer. Draft a CTD Module 2.3 Quality Overall Summary for {{drug_name}} using this CMC data: {{cmc}}.",
    "nonclinical": "Draft the Module 2.4 Nonclinical Overview for {{drug_name}}. Key findings: {{nonclinical}}.",
    "clinical": "Draft the Module 2.5 Clinical Overview for {{drug_name}}. Include study rationale and protocol {{protocol}}.",
}

def _render(doc_context, pid, section):
    tpl = DocxTemplate(TEMPLATE)
    tpl.render(doc_context)
    buf = io.BytesIO(); tpl.save(buf); buf.seek(0)
    append_history(pid, {
        "serial": doc_context.get("serial", "n/a"),
        "module2_section": section,
        "timestamp": datetime.datetime.utcnow().isoformat()
    })
    return StreamingResponse(buf,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": f"attachment; filename=Module2_{section}_{pid}.docx"})

@router.post("/{pid}/module2/{section}")
async def generate_narrative(pid: str, section: str):
    if section not in PROMPTS:
        raise HTTPException(400, "section must be quality, nonclinical, or clinical")
    meta = load_meta(pid) or {}
    if not meta:
        raise HTTPException(404, "Project not found")

    # Build minimal context
    prompt = PROMPTS[section].replace("{{drug_name}}", meta["drug_name"])
    prompt = prompt.replace("{{protocol}}", meta.get("protocol", ""))
    prompt = prompt.replace("{{cmc}}", "Batch: " + (meta.get("batch_number") or "N/A"))
    prompt = prompt.replace("{{nonclinical}}", "(data TBD)")

    completion = client.chat.completions.create(
        model="gpt-4o-mini",  # adjust if needed
        messages=[{"role":"user","content": prompt}],
        temperature=0.2,
    )
    narrative = completion.choices[0].message.content

    return _render({"narrative": narrative, **meta}, pid, section)