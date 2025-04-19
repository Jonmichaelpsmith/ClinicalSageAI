from sqlalchemy import Column, Integer, String, Float, Date
from server.db import Base  # your existing SQLAlchemy base

class CSR(Base):
    __tablename__ = "csrs"
    id          = Column(Integer, primary_key=True)
    title       = Column(String, nullable=False)
    therapeutic = Column(String)          # e.g. 'Oncology'
    protocol_id = Column(Integer)         # FK to protocols
    created_at  = Column(Date)

class Benchmark(Base):
    __tablename__ = "csr_benchmarks"
    id          = Column(Integer, primary_key=True)
    metric      = Column(String, nullable=False)   # e.g. 'Median Enrollment Time'
    value       = Column(Float)                    # numeric or string (store text if mixed)
    unit        = Column(String, default="days")   # optional
    source_csr  = Column(Integer)                  # FK to CSR.id for traceability

class InsightModel(Base):
    __tablename__ = "ai_insight_models"
    id          = Column(Integer, primary_key=True)
    name        = Column(String, nullable=False)   # e.g. 'Drop-Out Risk Predictor'
    description = Column(String)
    version     = Column(String)
    created_at  = Column(Date)