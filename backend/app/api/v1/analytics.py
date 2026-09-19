from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.analytics import AnalyticsOverview
from app.schemas.activity import ActivityResponse
from app.services.analytics_service import AnalyticsService
from app.models.activity import ActivityLog

router = APIRouter()


@router.get("/overview", response_model=AnalyticsOverview)
def get_analytics_overview(
    project_id: Optional[int] = Query(
        None, description="Optional project ID to scope analytics"
    ),
    db: Session = Depends(get_db),
):
    """
    Retrieve global or project-scoped KPIs, carbon trajectory trends,
    biodiversity radar scores, and biome distributions.
    """
    return AnalyticsService.get_overview(db, project_id=project_id)


@router.get("/activities", response_model=List[ActivityResponse])
def get_activities(
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """Retrieve recent platform audit activities and milestones."""
    activities = (
        db.query(ActivityLog).order_by(ActivityLog.timestamp.desc()).limit(limit).all()
    )
    return activities
