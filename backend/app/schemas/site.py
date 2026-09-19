from datetime import datetime
from typing import Optional, List, Any, Dict
from pydantic import BaseModel, Field, ConfigDict


class GeoJSONPolygon(BaseModel):
    type: str = Field(default="Polygon")
    coordinates: List[List[List[float]]]


class SiteBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    code: str = Field(..., min_length=1, max_length=50)
    habitat_type: str = Field(default="Primary Forest")
    elevation_m: float = Field(default=50.0)
    carbon_density_tco2e_per_ha: float = Field(default=180.0, ge=0.0)
    canopy_cover_pct: float = Field(default=80.0, ge=0.0, le=100.0)
    species_richness: int = Field(default=120, ge=0)
    soil_organic_carbon_pct: float = Field(default=4.0, ge=0.0, le=100.0)
    threat_level: str = Field(default="Low")
    monitoring_status: str = Field(default="Active Satellite Scan")


class SiteCreate(SiteBase):
    project_id: int
    geometry: Dict[str, Any]  # GeoJSON Polygon dict
    area_hectares: Optional[float] = (
        None  # If not provided, computed via Shapely geodesic
    )


class SiteUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    habitat_type: Optional[str] = None
    elevation_m: Optional[float] = None
    carbon_density_tco2e_per_ha: Optional[float] = None
    canopy_cover_pct: Optional[float] = None
    species_richness: Optional[int] = None
    soil_organic_carbon_pct: Optional[float] = None
    threat_level: Optional[str] = None
    monitoring_status: Optional[str] = None
    geometry: Optional[Dict[str, Any]] = None
    area_hectares: Optional[float] = None


class SiteResponse(SiteBase):
    id: int
    project_id: int
    area_hectares: float
    centroid_lat: float
    centroid_lng: float
    geometry: Dict[str, Any]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SiteFeature(BaseModel):
    type: str = "Feature"
    id: int
    geometry: Dict[str, Any]
    properties: Dict[str, Any]


class SiteFeatureCollection(BaseModel):
    type: str = "FeatureCollection"
    features: List[SiteFeature]
