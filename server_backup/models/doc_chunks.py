"""
Document Chunks Model with Vector Embeddings
Used for semantic search and context-aware document retrieval
"""

from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from pgvector.sqlalchemy import Vector

from server.db import Base

class DocumentChunk(Base):
    __tablename__ = "document_chunks"
    
    id = Column(Integer, primary_key=True)
    doc_id = Column(String(255), nullable=False)
    doc_title = Column(String(255))
    chunk_index = Column(Integer)
    content = Column(Text, nullable=False)
    embedding = Column(Vector(1536), nullable=True)  # OpenAI embedding dimension is 1536