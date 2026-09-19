from typing import List, Optional, Union
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.site import SiteCreate, SiteUpdate, SiteResponse, SiteFeatureCollection
from app.schemas.analytics import AnalyticsSnapshotResponse
from app.services.site_service import SiteService
from app.services.analytics_service import AnalyticsService
from app.services.auth_service import get_current_user_optional
from app.models.user import User

router = APIRouter()


@router.get("", response_model=Union[SiteFeatureCollection, List[SiteResponse]])
def list_sites(
    project_id: Optional[int] = Query(None, description="Filter sites by project ID"),
    as_geojson: bool = Query(
        True, description="Return as GeoJSON FeatureCollection for Mapbox GL JS"
    ),
    db: Session = Depends(get_db),
):
    """
    List geographical sites. Defaults to GeoJSON FeatureCollection format
    for direct integration into Mapbox GL JS sources.
    """
    return SiteService.get_sites(db, project_id=project_id, as_geojson=as_geojson)


@router.get("/{site_id}", response_model=SiteResponse)
def get_site(site_id: int, db: Session = Depends(get_db)):
    """Retrieve details for a specific site."""
    return SiteService.get_by_id(db, site_id)


@router.post("", response_model=SiteResponse, status_code=status.HTTP_201_CREATED)
def create_site(
    site_in: SiteCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    """
    Create a new site within a project from GeoJSON polygon geometry.
    Automatically calculates geodesic area in hectares and centroid.
    """
    user_id = current_user.id if current_user else None
    return SiteService.create(db, site_in, user_id=user_id)


@router.put("/{site_id}", response_model=SiteResponse)
def update_site(
    site_id: int,
    site_in: SiteUpdate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    """Update site attributes or polygon boundary."""
    user_id = current_user.id if current_user else None
    return SiteService.update(db, site_id, site_in, user_id=user_id)


@router.delete("/{site_id}")
def delete_site(
    site_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    """Delete site by ID."""
    user_id = current_user.id if current_user else None
    return SiteService.delete(db, site_id, user_id=user_id)


@router.get("/{site_id}/analytics", response_model=List[AnalyticsSnapshotResponse])
def get_site_analytics(site_id: int, db: Session = Depends(get_db)):
    """Retrieve monthly telemetry time-series (NDVI, biomass, carbon flux) for a site."""
    return AnalyticsService.get_site_analytics(db, site_id)
