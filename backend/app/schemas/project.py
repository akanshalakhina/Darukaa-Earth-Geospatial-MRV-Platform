from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class ProjectBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    description: Optional[str] = None
    project_type: str = Field(default="Mangrove Restoration")
    standard: str = Field(default="Verra VCS")
    status: str = Field(default="Active")
    country: str = Field(..., min_length=2)
    region: Optional[str] = None
    biome: str = Field(default="Tropical Moist Forest")
    estimated_annual_tco2e: float = Field(default=0.0, ge=0.0)
    target_biodiversity_score: float = Field(default=85.0, ge=0.0, le=100.0)
    budget: float = Field(default=0.0, ge=0.0)
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    developer_name: str = Field(default="Darukaa Conservation Labs")


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    project_type: Optional[str] = None
    standard: Optional[str] = None
    status: Optional[str] = None
    country: Optional[str] = None
    region: Optional[str] = None
    biome: Optional[str] = None
    estimated_annual_tco2e: Optional[float] = None
    target_biodiversity_score: Optional[float] = None
    budget: Optional[float] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    developer_name: Optional[str] = None


class ProjectSummary(BaseModel):
    id: int
    name: str
    slug: str
    project_type: str
    standard: str
    status: str
    country: str
    biome: str
    total_sites: int = 0
    total_hectares: float = 0.0
    estimated_annual_tco2e: float = 0.0
    target_biodiversity_score: float = 0.0

    model_config = ConfigDict(from_attributes=True)


class ProjectResponse(ProjectBase):
    id: int
    slug: str
    created_by_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    total_sites: int = 0
    total_hectares: float = 0.0
    total_carbon_stock: float = 0.0
    avg_canopy_cover: float = 0.0

    model_config = ConfigDict(from_attributes=True)
