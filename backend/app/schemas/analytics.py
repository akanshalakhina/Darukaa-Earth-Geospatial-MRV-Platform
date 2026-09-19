from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class AnalyticsSnapshotResponse(BaseModel):
    id: int
    project_id: int
    site_id: Optional[int] = None
    timestamp: datetime
    ndvi: float
    evi: float
    canopy_cover_pct: float
    biomass_density_mg_per_ha: float
    cumulative_tco2e: float
    monthly_flux_tco2e: float
    species_observed_count: int
    soil_moisture_pct: float

    model_config = ConfigDict(from_attributes=True)


class CarbonTrendItem(BaseModel):
    month_label: str
    actual_tco2e: float
    baseline_tco2e: float
    target_tco2e: float
    flux_tco2e: float


class BiodiversityRadar(BaseModel):
    taxa: List[str]
    current_index: List[float]
    baseline_index: List[float]


class BiomeBreakdown(BaseModel):
    biome: str
    project_count: int
    hectares: float
    tco2e: float


class AnalyticsOverview(BaseModel):
    total_projects: int
    total_sites: int
    total_hectares: float
    total_carbon_tco2e: float
    avg_biodiversity_score: float
    avg_canopy_cover: float
    active_verifications: int
    carbon_credits_value_usd: float
    monthly_carbon_trends: List[CarbonTrendItem]
    biodiversity_radar: BiodiversityRadar
    biome_breakdown: List[BiomeBreakdown]
