from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.history import AuditHistory
from app.schemas.stego import HistoryItem, DashboardStats

router = APIRouter(tags=["history_and_dashboard"])

@router.get("/history", response_model=List[HistoryItem])
def get_history(
    limit: int = Query(50, ge=1, le=200),
    action: str = Query(None),
    db: Session = Depends(get_db)
):
    """Retrieves operational audit history records."""
    query = db.query(AuditHistory)
    if action:
        query = query.filter(AuditHistory.action_type == action.upper())
    records = query.order_by(AuditHistory.created_at.desc()).limit(limit).all()

    return [
        HistoryItem(
            id=r.id,
            action_type=r.action_type,
            filename=r.filename,
            file_size_bytes=r.file_size_bytes,
            image_format=r.image_format,
            image_dimensions=r.image_dimensions,
            sha256_hash=r.sha256_hash,
            risk_score=r.risk_score,
            risk_value=r.risk_value,
            payload_size_bytes=r.payload_size_bytes,
            created_at=r.created_at.strftime("%Y-%m-%d %H:%M:%S")
        )
        for r in records
    ]

@router.get("/dashboard/stats", response_model=DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    """Computes real-time aggregate statistics for cybersecurity dashboard."""
    all_records = db.query(AuditHistory).all()

    images_analyzed = sum(1 for r in all_records if r.action_type in ("STEGANALYZE", "COMPARE"))
    messages_embedded = sum(1 for r in all_records if r.action_type == "EMBED")
    payloads_extracted = sum(1 for r in all_records if r.action_type == "EXTRACT")
    suspicious_images = sum(1 for r in all_records if r.risk_score in ("HIGH", "CRITICAL"))

    risk_values = [r.risk_value for r in all_records if r.risk_value is not None]
    avg_risk = float(sum(risk_values) / len(risk_values)) if risk_values else 0.0

    if avg_risk >= 70.0:
        avg_rating = "CRITICAL"
    elif avg_risk >= 45.0:
        avg_rating = "HIGH"
    elif avg_risk >= 25.0:
        avg_rating = "MEDIUM"
    else:
        avg_rating = "LOW"

    # Distribution counts
    risk_distribution = {
        "LOW": sum(1 for r in all_records if r.risk_score == "LOW"),
        "MEDIUM": sum(1 for r in all_records if r.risk_score == "MEDIUM"),
        "HIGH": sum(1 for r in all_records if r.risk_score == "HIGH"),
        "CRITICAL": sum(1 for r in all_records if r.risk_score == "CRITICAL"),
    }

    recent_activity = [
        HistoryItem(
            id=r.id,
            action_type=r.action_type,
            filename=r.filename,
            file_size_bytes=r.file_size_bytes,
            image_format=r.image_format,
            image_dimensions=r.image_dimensions,
            sha256_hash=r.sha256_hash,
            risk_score=r.risk_score,
            risk_value=r.risk_value,
            payload_size_bytes=r.payload_size_bytes,
            created_at=r.created_at.strftime("%Y-%m-%d %H:%M:%S")
        )
        for r in sorted(all_records, key=lambda x: x.created_at, reverse=True)[:10]
    ]

    return DashboardStats(
        images_analyzed=images_analyzed,
        messages_embedded=messages_embedded,
        payloads_extracted=payloads_extracted,
        suspicious_images=suspicious_images,
        average_risk_score=round(avg_risk, 1),
        average_risk_rating=avg_rating,
        recent_activity=recent_activity,
        risk_distribution=risk_distribution
    )
