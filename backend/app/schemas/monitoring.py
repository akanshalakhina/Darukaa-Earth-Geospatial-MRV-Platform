from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class SatelliteAlert(BaseModel):
    alert_id: str = Field(
        ..., description="Unique alert identifier e.g. FIRMS-2026-081"
    )
    site_id: Optional[int] = Field(
        None, description="Associated site parcel ID if inside boundary"
    )
    site_name: Optional[str] = Field(None, description="Associated site name")
    project_id: Optional[int] = Field(None, description="Associated project ID")
    project_name: Optional[str] = Field(None, description="Associated project name")
    latitude: float = Field(..., description="WGS84 latitude")
    longitude: float = Field(..., description="WGS84 longitude")
    confidence_pct: int = Field(..., ge=0, le=100, description="Confidence percentage")
    severity: str = Field(..., description="LOW, WARNING, or CRITICAL")
    detection_source: str = Field(
        ..., description="Satellite sensor e.g. Sentinel-2 MSI or VIIRS Thermal"
    )
    alert_type: str = Field(
        ..., description="Thermal Anomaly, Deforestation, or Canopy Degradation"
    )
    detected_at: datetime = Field(..., description="Timestamp of satellite acquisition")


class SatelliteConstellationStatus(BaseModel):
    satellite_name: str = Field(..., description="Satellite name e.g. Sentinel-2B")
    orbit_type: str = Field("Sun-synchronous LEO", description="Orbit type")
    sensor_type: str = Field("Multispectral (13 bands)", description="Sensor payload")
    resolution_m: float = Field(10.0, description="Spatial resolution in meters")
    next_overpass_utc: datetime = Field(..., description="Estimated next overpass time")
    status: str = Field("Operational", description="Telemetry status")
    cloud_cover_forecast_pct: int = Field(
        12, description="Projected cloud cover percentage"
    )


class MonitoringOverview(BaseModel):
    active_satellites: List[SatelliteConstellationStatus]
    total_alerts_last_30d: int
    critical_alerts_count: int
    recent_alerts: List[SatelliteAlert]
    last_system_scan: datetime
