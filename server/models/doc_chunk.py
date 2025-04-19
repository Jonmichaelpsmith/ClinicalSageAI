from sqlalchemy import Column, Integer, String, ForeignKey
from pgvector.sqlalchemy import Vector
from server.db import Base

class DocChunk(Base):
    __tablename__ = "doc_chunks"
    id = Column(Integer, primary_key=True)
    doc_id = Column(Integer, ForeignKey("csrs.id", ondelete="CASCADE"))
    content = Column(String, nullable=False)
    page = Column(Integer, nullable=True)  # Added page reference for PDF deep-link
    embedding = Column(Vector(1536), index=True)