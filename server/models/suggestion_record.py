from sqlalchemy import Column, Integer, String, Text, DateTime, JSON
from sqlalchemy.sql import func

from server.db import Base

class SuggestionRecord(Base):
    """Database model for agent suggestions."""

    __tablename__ = "suggestion_records"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, index=True, nullable=False)
    text = Column(Text, nullable=False)
    action_name = Column(String(255))
    action_args = Column(JSON)
    status = Column(String(50), index=True, default="pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    def __repr__(self) -> str:
        return f"<SuggestionRecord id={self.id} project_id={self.project_id} status={self.status}>"
