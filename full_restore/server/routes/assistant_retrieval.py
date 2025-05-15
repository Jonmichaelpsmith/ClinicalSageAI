"""
Assistant Retrieval API routes for context-aware assistant.
Provides semantic search over document chunks using pgvector.
"""

from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Request, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
import json
import time
import asyncio

import openai
from pgvector.sqlalchemy import cosine_distance

# Import database models
from sqlalchemy import Column, Integer, String, Text, Float, ForeignKey, create_engine
from sqlalchemy.orm import declarative_base, relationship, sessionmaker

# Create a router
router = APIRouter()

# Base class for SQLAlchemy models
Base = declarative_base()

# Document Chunk model with vector embeddings
class DocumentChunk(Base):
    __tablename__ = "document_chunks"
    
    id = Column(Integer, primary_key=True)
    doc_id = Column(String(255), nullable=False)
    doc_title = Column(String(255))
    chunk_index = Column(Integer)
    content = Column(Text, nullable=False)
    embedding = Column('embedding', Float(1536), nullable=True)  # OpenAI embedding dimension is 1536

# Database session dependency
def get_db():
    """Database dependency"""
    engine = create_engine("postgresql://postgres:postgres@localhost:5432/postgres")
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/retrieve")
def retrieve(request: Request, db: Session = Depends(get_db)):
    """
    Retrieve relevant document chunks based on semantic search
    """
    # Parse request
    data = request.json()
    query = data.get("query", "")
    
    # Generate embedding for the query
    openai_client = openai.OpenAI()
    embedding_response = openai_client.embeddings.create(
        model="text-embedding-ada-002",
        input=query
    )
    query_embedding = embedding_response.data[0].embedding
    
    # Perform similarity search using pgvector
    results = (
        db.query(DocumentChunk)
        .order_by(cosine_distance(DocumentChunk.embedding, query_embedding))
        .limit(5)
        .all()
    )
    
    # Format results
    formatted_results = []
    for chunk in results:
        formatted_results.append({
            "doc_id": chunk.doc_id,
            "doc_title": chunk.doc_title,
            "content": chunk.content,
            "chunk_index": chunk.chunk_index
        })
    
    return {"results": formatted_results}

@router.post("/stream_with_context")
async def chat_stream_with_context(request: Request, db: Session = Depends(get_db)):
    """
    Stream OpenAI completions with document context for citations
    """
    # Parse request
    data = await request.json()
    messages = data.get("messages", [])
    query = data.get("query", "")
    
    # Generate embedding for the query
    openai_client = openai.OpenAI()
    embedding_response = openai_client.embeddings.create(
        model="text-embedding-ada-002",
        input=query
    )
    query_embedding = embedding_response.data[0].embedding
    
    # Perform similarity search using pgvector
    results = []
    try:
        results = (
            db.query(DocumentChunk)
            .order_by(cosine_distance(DocumentChunk.embedding, query_embedding))
            .limit(5)
            .all()
        )
    except Exception as e:
        print(f"Vector search error: {e}")
    
    # Format context
    context = ""
    citations = []
    
    if results:
        context = "Here are some relevant document excerpts that might help with the response:\n\n"
        for i, chunk in enumerate(results):
            formatted_citation = {
                "doc_id": chunk.doc_id,
                "doc_title": chunk.doc_title or f"Document {chunk.doc_id}",
                "content": chunk.content,
                "chunk_index": chunk.chunk_index,
                "page": chunk.page,  # Include page number if available
                "idx": i+1           # Citation index
            }
            citations.append(formatted_citation)
            page_info = f" (page {chunk.page})" if chunk.page else ""
            context += f"[{i+1}] From {chunk.doc_title or f'Document {chunk.doc_id}'}{page_info}: {chunk.content}\n\n"
    
    # Prepare system message with context
    system_message = {
        "role": "system",
        "content": """You are TrialSage Assistant, an expert in clinical trials, regulatory research, and drug development.
Use your knowledge to help the user with their clinical trial and regulatory questions.
If the information is available in the provided context, make sure to reference it using citation numbers like [1], [2], etc.
Be accurate, helpful, and clear in your responses."""
    }
    
    if context:
        system_message["content"] += f"\n\n{context}"
    
    # Add system message to the beginning of the messages
    full_messages = [system_message] + messages
    
    def gen():
        # First, send the metadata with citation information
        metadata_json = json.dumps({
            "metadata": {
                "citations": citations
            }
        })
        yield f"{metadata_json}\n"
        
        # Then stream the actual response
        try:
            stream = openai_client.chat.completions.create(
                model="gpt-4o",  # the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
                messages=full_messages,
                stream=True,
            )
            
            for chunk in stream:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
                    
        except Exception as e:
            yield f"\n\nError generating response: {str(e)}"
    
    return StreamingResponse(gen(), media_type="text/event-stream")