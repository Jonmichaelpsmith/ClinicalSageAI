"""
CER Sequence Models

This module defines SQLAlchemy models for CER (Clinical Evaluation Report) sequences
and related documents.
"""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from server.db import Base
from server.models.document import Document as BaseDocument

class CERSequence(Base):
    """
    Clinical Evaluation Report sequence model.
    
    Represents a compiled sequence of documents for CER submission.
    """
    __tablename__ = "cer_sequences"

    id = Column(Integer, primary_key=True)
    region = Column(String, nullable=False)
    created = Column(DateTime, nullable=False)
    status = Column(String, default="draft")
    exported_path = Column(String, nullable=True)
    
    # Relationships
    documents = relationship("CERSequenceDoc", back_populates="sequence", cascade="all, delete-orphan")

class CERSequenceDoc(Base):
    """
    Document within a CER sequence.
    
    Links a document to a specific module within a CER sequence.
    """
    __tablename__ = "cer_sequence_docs"

    id = Column(Integer, primary_key=True)
    sequence_id = Column(Integer, ForeignKey("cer_sequences.id", ondelete="CASCADE"), nullable=False)
    doc_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    module = Column(String, nullable=False)
    file_path = Column(String, nullable=True)
    
    # Relationships
    sequence = relationship("CERSequence", back_populates="documents")
    document = relationship("BaseDocument")