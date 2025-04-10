from fastapi import APIRouter, Depends
from pydantic import BaseModel
import os
import requests
import json
import time

router = APIRouter()

HF_API_KEY = os.getenv("HF_API_KEY")
HF_MODEL_URL = "https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1"
VERSION_PATH = "data/protocol_versions"

class ProtocolImproveRequest(BaseModel):
    protocol: str
    domain: str = "general"

class SaveVersionRequest(BaseModel):
    protocol_id: str
    version_text: str
    source: str = "AI Agent"

@router.post("/api/protocol/improve")
def improve_protocol(req: ProtocolImproveRequest):
    prompt = f"""
You are a clinical trial protocol design expert. A user has submitted a draft study protocol for a trial in the domain of {req.domain}. Your job is to:
1. Compare the design with historical CSRs from similar trials.
2. Identify differences in endpoints, arm structure, sample size, or dropout assumptions.
3. Suggest specific improvements, with rationale.
4. Format the output clearly.

Protocol to review:
{req.protocol}

A:
"""

    try:
        res = requests.post(
            HF_MODEL_URL,
            headers={"Authorization": f"Bearer {HF_API_KEY}"},
            json={"inputs": prompt}
        )
        
        response = res.json()
        recommendation = response[0]["generated_text"].split("A:")[-1].strip()
        return {"recommendation": recommendation}
    except Exception as e:
        return {"recommendation": f"Error: {str(e)}"}

@router.post("/api/protocol/save-version")
def save_version(req: SaveVersionRequest):
    os.makedirs(VERSION_PATH, exist_ok=True)
    filename = f"{VERSION_PATH}/{req.protocol_id}_{int(time.time())}.json"
    with open(filename, "w") as f:
        json.dump({
            "timestamp": time.time(),
            "source": req.source,
            "version_text": req.version_text
        }, f)
    return {"message": "Version saved", "path": filename}

@router.get("/api/protocol/versions/{protocol_id}")
def get_versions(protocol_id: str):
    versions = []
    if os.path.exists(VERSION_PATH):
        for fname in os.listdir(VERSION_PATH):
            if fname.startswith(protocol_id):
                with open(os.path.join(VERSION_PATH, fname)) as f:
                    versions.append(json.load(f))
    versions.sort(key=lambda x: x["timestamp"], reverse=True)
    return versions