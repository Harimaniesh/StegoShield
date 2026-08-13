from sqlalchemy import Column, String, Integer, DateTime, Float, Text
from datetime import datetime
from app.core.database import Base

class AuditHistory(Base):
    __tablename__ = "audit_history"

    id = Column(String(36), primary_key=True, index=True)
    action_type = Column(String(50), nullable=False, index=True)  # EMBED, EXTRACT, STEGANALYZE, COMPARE
    filename = Column(String(255), nullable=False)
    file_size_bytes = Column(Integer, nullable=False)
    image_format = Column(String(50), nullable=False)
    image_dimensions = Column(String(50), nullable=False)  # e.g., "1920x1080"
    sha256_hash = Column(String(64), nullable=False)
    risk_score = Column(String(20), nullable=True)  # LOW, MEDIUM, HIGH, CRITICAL
    risk_value = Column(Float, nullable=True)  # 0.0 - 100.0
    payload_size_bytes = Column(Integer, nullable=True)
    details_json = Column(Text, nullable=True)  # Additional metadata / stats in JSON
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
