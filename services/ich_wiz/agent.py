"""
ICH Wiz Agent API

This module provides a FastAPI-based REST API for the ICH Wiz agent.
It handles user queries, retrieves relevant information from ICH guidelines,
and generates responses using OpenAI.
"""
import json
import os
import time
from enum import Enum
from typing import Dict, List, Optional, Any, Union

import openai
from fastapi import FastAPI, Depends, HTTPException, Query, Request, Security
from fastapi.security.api_key import APIKeyHeader, APIKey
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import structlog

from services.ich_wiz.config import settings
from services.ich_wiz.indexer import search_similar, initialize as initialize_indexer

# Set up logging
logger = structlog.get_logger(__name__)

# Set up OpenAI API
openai.api_key = settings.OPENAI_API_KEY

# Initialize API security
if settings.API_AUTH_ENABLED:
    api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)

    async def get_api_key(api_key_header: str = Security(api_key_header)):
        if api_key_header == settings.API_KEY:
            return api_key_header
        raise HTTPException(
            status_code=403, detail="Invalid API key or API key missing"
        )
else:
    async def get_api_key():
        return None

# Create FastAPI app
app = FastAPI(
    title="ICH Wiz API",
    description="AI-powered ICH guidelines assistant",
    version="1.0.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ALLOW_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define API models
class QuerySource(str, Enum):
    """Source of the query for context."""
    PROTOCOL = "protocol"
    CSR = "csr"
    STUDY_DESIGN = "study_design"
    REGULATORY = "regulatory"
    ECTD = "ectd"
    GENERAL = "general"


class QueryRequest(BaseModel):
    """Request model for ICH Wiz queries."""
    query: str = Field(..., description="User query about ICH guidelines")
    source: Optional[QuerySource] = Field(
        default=QuerySource.GENERAL,
        description="Source context of the query"
    )
    context: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Additional context for the query"
    )
    max_results: Optional[int] = Field(
        default=5,
        description="Maximum number of results to return"
    )


class Citation(BaseModel):
    """Citation model for ICH Wiz responses."""
    text: str = Field(..., description="Cited text")
    source: str = Field(..., description="Source of the citation")
    document_id: str = Field(..., description="Document ID")
    relevance: float = Field(..., description="Relevance score")


class TaskItem(BaseModel):
    """Task item model for ICH Wiz responses."""
    task: str = Field(..., description="Task to perform")
    priority: str = Field(..., description="Priority (high, medium, low)")
    rationale: str = Field(..., description="Rationale for the task")


class QueryResponse(BaseModel):
    """Response model for ICH Wiz queries."""
    answer: str = Field(..., description="Answer to the query")
    citations: List[Citation] = Field(default_factory=list, description="Citations")
    tasks: List[TaskItem] = Field(default_factory=list, description="Suggested tasks")
    query: str = Field(..., description="Original query")
    source: str = Field(..., description="Source context of the query")
    processing_time: float = Field(..., description="Processing time in seconds")


class HealthResponse(BaseModel):
    """Health check response model."""
    status: str = Field(..., description="Service status")
    version: str = Field(..., description="Service version")
    docs_indexed: int = Field(..., description="Number of documents indexed")
    timestamp: str = Field(..., description="Current timestamp")


class StatsResponse(BaseModel):
    """Stats response model."""
    total_documents: int = Field(..., description="Total documents indexed")
    document_type_counts: Dict[str, int] = Field(..., description="Document counts by type")
    guideline_type_counts: Dict[str, int] = Field(..., description="ICH guideline counts by type")
    total_vectors: int = Field(..., description="Total vector count")
    generated_at: str = Field(..., description="Timestamp when stats were generated")


# Define API routes
@app.get("/health", response_model=HealthResponse, tags=["System"])
async def health_check():
    """Health check endpoint."""
    try:
        # Get stats about indexed documents
        stats_file = os.path.join(settings.DATA_DIR, "stats.json")
        if os.path.exists(stats_file):
            with open(stats_file, "r", encoding="utf-8") as f:
                stats = json.load(f)
            docs_indexed = stats.get("total_documents", 0)
        else:
            docs_indexed = 0
            
        return {
            "status": "healthy",
            "version": "1.0.0",
            "docs_indexed": docs_indexed,
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        }
    except Exception as e:
        logger.error("Health check failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")


@app.get("/stats", response_model=StatsResponse, tags=["System"])
async def get_stats(api_key: APIKey = Depends(get_api_key)):
    """Get statistics about indexed documents."""
    try:
        stats_file = os.path.join(settings.DATA_DIR, "stats.json")
        if not os.path.exists(stats_file):
            raise HTTPException(status_code=404, detail="Stats not found")
            
        with open(stats_file, "r", encoding="utf-8") as f:
            stats = json.load(f)
            
        return stats
    except Exception as e:
        logger.error("Failed to get stats", error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to get stats: {str(e)}")


@app.post("/api/ich-wiz", response_model=QueryResponse, tags=["ICH Wiz"])
async def process_query(
    request: QueryRequest,
    api_key: APIKey = Depends(get_api_key)
):
    """
    Process a query about ICH guidelines and generate a response.
    
    Args:
        request: Query request
        
    Returns:
        Query response with answer, citations, and suggested tasks
    """
    start_time = time.time()
    query = request.query
    source = request.source
    context = request.context or {}
    max_results = request.max_results
    
    try:
        logger.info(
            "Processing query",
            query=query,
            source=source,
            context_keys=list(context.keys()) if context else None
        )
        
        # Search for relevant guidelines
        search_results = search_similar(
            query=query,
            filter_dict={"document_type": "ich_guideline"},
            top_k=max_results
        )
        
        # Extract context from search results
        contexts = []
        citations = []
        
        for i, result in enumerate(search_results):
            metadata = result["metadata"]
            text = metadata.get("text", "")
            document_id = metadata.get("document_id", f"doc_{i}")
            guideline_id = metadata.get("guideline_id", "Unknown guideline")
            
            # Add to contexts for the prompt
            contexts.append(f"Document: {guideline_id}\nContent: {text}\n")
            
            # Add to citations for the response
            citations.append({
                "text": text,
                "source": guideline_id,
                "document_id": document_id,
                "relevance": result["score"]
            })
        
        # Build prompt
        system_prompt = """You are ICH Wiz, an expert AI assistant specializing in International Council for Harmonisation of Technical Requirements for Pharmaceuticals for Human Use (ICH) guidelines. 
        
You help pharmaceutical professionals understand and apply ICH guidelines correctly in their regulatory submissions and clinical development activities.

You should provide accurate, nuanced, and guidelines-based answers. If certain information is not contained in the ICH guidelines, clearly state that.

Format your response as follows:
1. Provide a clear, concise answer to the query
2. Reference specific ICH guidelines and sections when applicable
3. End with a list of 2-3 concrete action items/tasks that would help the user ensure compliance with relevant ICH guidelines

Make sure your answers are directly relevant to pharmaceutical regulatory contexts and reflect current ICH guidelines.
"""

        query_context = f"Query source: {source.value}\n"
        if context:
            query_context += "Additional context:\n"
            for key, value in context.items():
                query_context += f"- {key}: {value}\n"
                
        guidelines_context = "Here are the most relevant ICH guideline passages:\n\n" + "\n\n".join(contexts)
        
        user_prompt = f"{query_context}\n\nUser query: {query}\n\n{guidelines_context}"
        
        # Generate response using OpenAI
        response = openai.chat.completions.create(
            model=settings.OPENAI_COMPLETION_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.2,
            max_tokens=1500
        )
        
        answer = response.choices[0].message.content.strip()
        
        # Extract tasks
        tasks = extract_tasks(answer)
        
        processing_time = time.time() - start_time
        
        # Construct response
        result = {
            "answer": answer,
            "citations": citations,
            "tasks": tasks,
            "query": query,
            "source": source.value,
            "processing_time": processing_time,
        }
        
        logger.info(
            "Query processed successfully",
            query=query,
            processing_time=processing_time,
            citation_count=len(citations),
            task_count=len(tasks)
        )
        
        return result
    
    except Exception as e:
        logger.error("Failed to process query", query=query, error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to process query: {str(e)}")


def extract_tasks(text: str) -> List[Dict[str, str]]:
    """
    Extract tasks from the AI response.
    This is a simple implementation; in a production system,
    this would be more sophisticated.
    
    Args:
        text: AI response text
        
    Returns:
        List of task dictionaries
    """
    tasks = []
    
    # Try to find a tasks section
    task_section = None
    
    # Look for common task section headers
    task_headers = [
        "Tasks:", "Action Items:", "Next Steps:", "Recommended Actions:",
        "Suggested Tasks:", "To-Do Items:", "Action Plan:"
    ]
    
    for header in task_headers:
        if header in text:
            task_section = text.split(header, 1)[1].strip()
            break
    
    # If no task section found, return empty list
    if not task_section:
        return tasks
    
    # Split by numbers or bullet points
    task_markers = ['\n1. ', '\n2. ', '\n3. ', '\n4. ', '\n5. ',
                   '\n- ', '\n• ', '\n* ', '\n– ']
    
    for marker in task_markers:
        if marker in task_section:
            task_items = task_section.split(marker)
            # Skip the first item as it's empty or a header
            for item in task_items[1:]:
                # Clean up and limit to the first sentence or phrase
                task_text = item.split('\n', 1)[0].strip()
                
                # Assign priority based on language
                priority = "medium"
                if any(word in task_text.lower() for word in ["urgent", "critical", "immediately", "crucial"]):
                    priority = "high"
                elif any(word in task_text.lower() for word in ["consider", "might", "optional", "if needed"]):
                    priority = "low"
                
                # Extract rationale if present
                rationale = "Ensures compliance with ICH guidelines"
                if " - " in task_text:
                    task_parts = task_text.split(" - ", 1)
                    task_text = task_parts[0].strip()
                    rationale = task_parts[1].strip()
                
                tasks.append({
                    "task": task_text,
                    "priority": priority,
                    "rationale": rationale
                })
            
            # If we found tasks with this marker, stop looking
            if tasks:
                break
    
    return tasks


@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Middleware to log requests."""
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    
    logger.info(
        "Request processed",
        method=request.method,
        url=str(request.url),
        status_code=response.status_code,
        process_time=process_time
    )
    
    return response


# Initialize the API
@app.on_event("startup")
async def startup_event():
    """Startup event handler."""
    try:
        # Initialize the indexer
        initialize_indexer()
        logger.info("ICH Wiz API initialized successfully")
    except Exception as e:
        logger.error("Failed to initialize ICH Wiz API", error=str(e))
        raise


# Prometheus metrics
try:
    from prometheus_fastapi_instrumentator import Instrumentator
    
    @app.on_event("startup")
    async def enable_metrics():
        """Enable Prometheus metrics."""
        Instrumentator().instrument(app).expose(app, include_in_schema=False)
        logger.info("Prometheus metrics enabled")
except ImportError:
    logger.warning("Prometheus FastAPI Instrumentator not installed, metrics disabled")


# Run the API
if __name__ == "__main__":
    import uvicorn
    
    # Get port from environment or use default
    port = int(os.environ.get("PORT", 8080))
    
    # Run the API
    uvicorn.run(
        "services.ich_wiz.agent:app",
        host="0.0.0.0",
        port=port,
        reload=True
    )