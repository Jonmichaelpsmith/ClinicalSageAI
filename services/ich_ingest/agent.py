"""
ICH Specialist Agent API.

This module provides an HTTP API for the ICH Specialist service, 
with endpoints for querying the agent, health checks, and metrics.
"""
import logging
import time
from typing import List, Dict, Any, Optional

import openai
from fastapi import FastAPI, HTTPException, Depends, Security, Request
from fastapi.security.api_key import APIKeyHeader
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import structlog

from .config import settings
from .indexer import query_similar
from .metrics import setup_metrics

# Configure structured logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
)

log = structlog.get_logger()

# Initialize FastAPI app
app = FastAPI(
    title="TrialSage ICH Specialist",
    description="AI-driven ICH guideline compliance and project management co-pilot",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# API Key authentication
api_key_header = APIKeyHeader(name="X-API-KEY", auto_error=False)

async def get_api_key(api_key: Optional[str] = Security(api_key_header)):
    """Validate the API key if authentication is enabled."""
    if not settings.API_AUTH_ENABLED:
        return None
        
    if api_key is None or api_key != settings.API_KEY:
        log.warning("Invalid API key attempt")
        raise HTTPException(
            status_code=403,
            detail="Invalid or missing API key"
        )
    return api_key

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# Set up metrics
setup_metrics(app)

# API models
class ICHQuery(BaseModel):
    """Model for ICH specialist query."""
    question: str = Field(..., description="The question to ask the ICH specialist")
    module: str = Field(..., description="The module context (e.g., 'protocol', 'csr_review', 'cmc')")
    context: Optional[str] = Field(None, description="Additional context for the question")

class ICHTask(BaseModel):
    """Model for a suggested task."""
    title: str = Field(..., description="Task title")
    module: str = Field(..., description="Module the task is related to")
    priority: Optional[str] = Field(None, description="Task priority")
    due_date: Optional[str] = Field(None, description="Suggested due date")

class ICHResponse(BaseModel):
    """Model for ICH specialist response."""
    answer: str = Field(..., description="The answer to the question")
    sources: List[str] = Field(default_factory=list, description="Sources used for the answer")
    tasks: List[ICHTask] = Field(default_factory=list, description="Suggested follow-up tasks")

# API Endpoints
@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "ok"}

@app.post("/api/ich-agent", response_model=ICHResponse, dependencies=[Depends(get_api_key)])
async def ich_agent(query: ICHQuery, request: Request):
    """
    Query the ICH Specialist Agent.
    
    This endpoint provides AI-driven guidance on ICH guidelines
    and compliance, along with suggested follow-up tasks.
    """
    client_ip = request.client.host
    request_id = f"{int(time.time() * 1000)}-{client_ip}"
    log_ctx = {"request_id": request_id, "module": query.module, "ip": client_ip}
    
    log.info("ICH Agent query received", **log_ctx)
    
    try:
        # Get relevant documents from vector store
        hits = query_similar(query.question)
        snippets = [
            f"[{m['metadata']['source']}] {m['metadata']['text'][:150]}..." 
            for m in hits["matches"]
        ]
        
        # Build prompt
        system_msg = "You are TrialSage's ICH compliance expert and project manager."
        user_msg = (
            f"Module: {query.module}\nQuestion: {query.question}\n\n" 
            + "\n".join(snippets)
        )
        
        if query.context:
            user_msg += f"\n\nAdditional context: {query.context}"
        
        # Call OpenAI
        start_time = time.time()
        resp = await openai.ChatCompletion.acreate(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_msg},
                {"role": "user", "content": user_msg}
            ],
            temperature=0.7,
            max_tokens=1000
        )
        end_time = time.time()
        
        answer = resp.choices[0].message.content
        tasks = _generate_tasks(answer, query.module)
        sources = [m["metadata"]["source"] for m in hits["matches"][:3]]
        
        log.info(
            "ICH Agent query processed", 
            duration=round(end_time - start_time, 2),
            sources_count=len(sources),
            tasks_count=len(tasks),
            **log_ctx
        )
        
        return {
            "answer": answer,
            "tasks": tasks,
            "sources": sources
        }
        
    except Exception as e:
        log.error(f"ICH Agent error: {str(e)}", error=str(e), **log_ctx)
        raise HTTPException(status_code=500, detail="Internal server error")

def _generate_tasks(answer: str, module: str) -> List[Dict[str, Any]]:
    """Generate suggested tasks based on the agent's answer."""
    tasks = []
    lower = answer.lower()
    
    # Common task patterns
    if 'validat' in lower or 'complian' in lower:
        tasks.append({
            "title": f"Validate ICH compliance for {module}",
            "module": module,
            "priority": "high"
        })
    
    if 'review' in lower:
        tasks.append({
            "title": f"Review {module} guidelines",
            "module": module,
            "priority": "medium"
        })
        
    if 'update' in lower:
        tasks.append({
            "title": f"Update {module} documentation",
            "module": module,
            "priority": "medium"
        })
    
    # Module-specific tasks
    if module == "protocol":
        if 'endpoint' in lower:
            tasks.append({
                "title": "Review protocol endpoints",
                "module": "protocol",
                "priority": "high"
            })
        if 'inclusion' in lower or 'exclusion' in lower:
            tasks.append({
                "title": "Review inclusion/exclusion criteria",
                "module": "protocol",
                "priority": "medium"
            })
    
    elif module == "csr_review":
        if 'safety' in lower:
            tasks.append({
                "title": "Validate safety reporting",
                "module": "csr_review",
                "priority": "high"
            })
    
    elif module == "cmc":
        if 'stability' in lower:
            tasks.append({
                "title": "Review stability protocol",
                "module": "cmc",
                "priority": "high"
            })
    
    # Add at least one follow-up task if none were generated
    if not tasks:
        tasks.append({
            "title": f"Review {module} requirements",
            "module": module,
            "priority": "medium"
        })
    
    return tasks