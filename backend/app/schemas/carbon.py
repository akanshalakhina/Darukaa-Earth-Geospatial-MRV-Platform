from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class CarbonMarketRate(BaseModel):
    category: str = Field(..., description="Project type e.g. Blue Carbon / Mangroves")
    ticker: str = Field(..., description="Market ticker symbol e.g. VCM-BLU")
    spot_price_usd: float = Field(
        ..., description="Current spot price per tCO2e in USD"
    )
    change_30d_pct: float = Field(..., description="Percentage change in last 30 days")
    trend: str = Field("up", description="up, down, or stable")
    volume_monthly_tco2e: int = Field(
        ..., description="Monthly trading volume in metric tons"
    )
    standard_compliance: str = Field(
        "Verra VCS / Plan Vivo", description="Applicable MRV standard"
    )


class MRVCertificate(BaseModel):
    certificate_id: str = Field(..., description="Cryptographic certificate identifier")
    project_id: int
    project_name: str
    standard: str
    country: str
    biome: str
    verified_area_hectares: float
    issued_carbon_credits_tco2e: float
    valuation_usd: float
    verification_period_start: datetime
    verification_period_end: datetime
    methodology: str
    registry_serial_number: str
    digital_signature_hash: str
    auditor_organization: str
    lead_auditor_name: str
    issued_at: datetime
    verification_status: str = Field("Verified & Sealed", description="Current status")


class IssueCreditsRequest(BaseModel):
    project_id: int
    credits_to_issue_tco2e: float = Field(..., gt=0)
    vintage_year: int = Field(2025, ge=2020, le=2030)
    notes: Optional[str] = None


class IssueCreditsResponse(BaseModel):
    success: bool
    certificate_id: str
    serial_number: str
    issued_amount_tco2e: float
    remaining_pipeline_tco2e: float
    message: str
